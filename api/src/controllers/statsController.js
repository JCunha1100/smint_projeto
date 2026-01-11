import prisma from '../config/database.js';
import { calculateLevel, getAchievements } from '../utils/scoreCalculator.js';
import { groupByPeriod, getLastPeriods, formatDateOnly, getStartOfMonth } from '../utils/dateUtils.js';
import { ApiError } from '../middleware/errorHandler.js';
import { config } from '../config/index.js';

/**
 * Get leaderboard
 * GET /api/stats/leaderboard
 */
export async function getLeaderboard(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const skip = (pageNum - 1) * limitNum;
    
    // Get users sorted by total score
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        orderBy: { totalScore: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          name: true,
          avatar: true,
          totalScore: true,
          level: true,
          streak: true,
          createdAt: true,
          _count: {
            select: { activities: true }
          }
        }
      }),
      prisma.user.count()
    ]);
    
    // Find current user's rank
    const currentUserRank = await prisma.user.count({
      where: {
        totalScore: { gt: req.user.totalScore }
      }
    }) + 1;
    
    // Get percentile
    const percentile = Math.round((1 - (currentUserRank / totalCount)) * 100);
    
    // Add rank to users
    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      ...user,
      activitiesCount: user._count.activities,
      levelInfo: calculateLevel(user.totalScore)
    }));
    
    // Find current user in leaderboard
    const currentUserInList = leaderboard.find(u => u.id === req.userId);
    
    res.json({
      success: true,
      data: {
        leaderboard,
        currentUser: {
          rank: currentUserRank,
          percentile,
          ...req.user,
          levelInfo: calculateLevel(req.user.totalScore),
          isInTopList: currentUserInList !== undefined
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get dashboard data
 * GET /api/stats/dashboard
 */
export async function getDashboard(req, res, next) {
  try {
    const now = new Date();
    const startOfMonth = getStartOfMonth(now);
    
    // Get current user's stats
    const [
      userStats,
      recentActivities,
      monthlyStats,
      achievements
    ] = await Promise.all([
      // User aggregate stats
      prisma.activity.aggregate({
        where: { userId: req.userId },
        _sum: {
          duration: true,
          score: true,
          distance: true
        },
        _count: true
      }),
      
      // Recent activities (last 5)
      prisma.activity.findMany({
        where: { userId: req.userId },
        orderBy: { date: 'desc' },
        take: 5,
        select: {
          id: true,
          sportType: true,
          duration: true,
          date: true,
          intensity: true,
          score: true
        }
      }),
      
      // This month's stats
      prisma.activity.aggregate({
        where: {
          userId: req.userId,
          date: { gte: startOfMonth }
        },
        _sum: {
          duration: true,
          score: true
        },
        _count: true
      }),
      
      // User achievements
      prisma.activity.findMany({
        where: { userId: req.userId },
        orderBy: { date: 'desc' },
        select: {
          sportType: true,
          duration: true,
          date: true,
          intensity: true,
          score: true,
          createdAt: true
        }
      })
    ]);
    
    // Calculate level info
    const totalScore = userStats._sum.score || 0;
    const levelInfo = calculateLevel(totalScore);
    
    // Get weekly progress
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    
    const weeklyStats = await prisma.activity.aggregate({
      where: {
        userId: req.userId,
        date: { gte: weekStart }
      },
      _sum: {
        duration: true,
        score: true
      },
      _count: true
    });
    
    // Get activity breakdown by sport
    const sportBreakdown = await prisma.activity.groupBy({
      by: ['sportType'],
      where: { userId: req.userId },
      _sum: {
        duration: true
      },
      _count: true,
      orderBy: { _count: { sportType: 'desc' } }
    });
    
    // Get user achievements
    const earnedAchievements = getAchievements(achievements);
    
    res.json({
      success: true,
      data: {
        user: {
          id: req.userId,
          name: req.user.name,
          email: req.user.email,
          totalScore,
          level: levelInfo.level,
          levelProgress: levelInfo.progress,
          streak: req.user.streak || 0
        },
        summary: {
          totalActivities: userStats._count,
          totalMinutes: userStats._sum.duration || 0,
          totalDistance: Math.round((userStats._sum.distance || 0) * 100) / 100,
          averageScorePerActivity: userStats._count > 0 
            ? Math.round((totalScore / userStats._count) * 100) / 100 
            : 0
        },
        monthly: {
          activities: monthlyStats._count,
          minutes: monthlyStats._sum.duration || 0,
          score: monthlyStats._sum.score || 0
        },
        weekly: {
          activities: weeklyStats._count,
          minutes: weeklyStats._sum.duration || 0,
          score: weeklyStats._sum.score || 0
        },
        recentActivities,
        sportBreakdown: sportBreakdown.map(s => ({
          sportType: s.sportType,
          count: s._count.sportType,
          totalMinutes: s._sum.duration || 0
        })),
        achievements: earnedAchievements.slice(0, 5),
        levelInfo
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get weekly summary
 * GET /api/stats/weekly
 */
export async function getWeeklySummary(req, res, next) {
  try {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    
    const activities = await prisma.activity.findMany({
      where: {
        userId: req.userId,
        date: { gte: weekStart }
      },
      orderBy: { date: 'asc' }
    });
    
    // Group by day
    const dailyData = {};
    const sportData = {};
    
    activities.forEach(activity => {
      const dateKey = formatDateOnly(activity.date);
      
      // Daily aggregation
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          activities: 0,
          minutes: 0,
          score: 0
        };
      }
      dailyData[dateKey].activities++;
      dailyData[dateKey].minutes += activity.duration;
      dailyData[dateKey].score += activity.score;
      
      // Sport aggregation
      if (!sportData[activity.sportType]) {
        sportData[activity.sportType] = {
          sportType: activity.sportType,
          activities: 0,
          minutes: 0
        };
      }
      sportData[activity.sportType].activities++;
      sportData[activity.sportType].minutes += activity.duration;
    });
    
    // Calculate totals
    const totalMinutes = activities.reduce((sum, a) => sum + a.duration, 0);
    const totalScore = activities.reduce((sum, a) => sum + a.score, 0);
    const uniqueDays = Object.keys(dailyData).length;
    
    res.json({
      success: true,
      data: {
        period: {
          start: formatDateOnly(weekStart),
          end: formatDateOnly(now)
        },
        summary: {
          totalActivities: activities.length,
          totalMinutes,
          totalScore,
          averageMinutesPerDay: Math.round(totalMinutes / uniqueDays) || 0,
          activeDays: uniqueDays
        },
        dailyData: Object.values(dailyData),
        sportBreakdown: Object.values(sportData).sort((a, b) => b.minutes - a.minutes)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get monthly summary
 * GET /api/stats/monthly
 */
export async function getMonthlySummary(req, res, next) {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? parseInt(month, 10) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();
    
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
    
    const activities = await prisma.activity.findMany({
      where: {
        userId: req.userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      orderBy: { date: 'asc' }
    });
    
    // Group by week
    const weeklyData = {};
    const sportData = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.date);
      const weekNumber = Math.ceil(date.getDate() / 7);
      const weekKey = `Week ${weekNumber}`;
      
      // Weekly aggregation
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          activities: 0,
          minutes: 0,
          score: 0
        };
      }
      weeklyData[weekKey].activities++;
      weeklyData[weekKey].minutes += activity.duration;
      weeklyData[weekKey].score += activity.score;
      
      // Sport aggregation
      if (!sportData[activity.sportType]) {
        sportData[activity.sportType] = {
          sportType: activity.sportType,
          activities: 0,
          minutes: 0,
          score: 0
        };
      }
      sportData[activity.sportType].activities++;
      sportData[activity.sportType].minutes += activity.duration;
      sportData[activity.sportType].score += activity.score;
    });
    
    // Calculate totals
    const totalMinutes = activities.reduce((sum, a) => sum + a.duration, 0);
    const totalScore = activities.reduce((sum, a) => sum + a.score, 0);
    
    // Intensity breakdown
    const intensityData = activities.reduce((acc, activity) => {
      if (!acc[activity.intensity]) {
        acc[activity.intensity] = { intensity: activity.intensity, count: 0, minutes: 0 };
      }
      acc[activity.intensity].count++;
      acc[activity.intensity].minutes += activity.duration;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        period: {
          month: targetMonth + 1,
          year: targetYear,
          start: formatDateOnly(startOfMonth),
          end: formatDateOnly(endOfMonth)
        },
        summary: {
          totalActivities: activities.length,
          totalMinutes,
          totalScore,
          averageMinutesPerActivity: activities.length > 0 
            ? Math.round(totalMinutes / activities.length) 
            : 0,
          activeWeeks: Object.keys(weeklyData).length
        },
        weeklyData: Object.values(weeklyData),
        sportBreakdown: Object.values(sportData).sort((a, b) => b.minutes - a.minutes),
        intensityBreakdown: Object.values(intensityData).sort((a, b) => b.minutes - a.minutes),
        topActivities: activities.slice(0, 5)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get yearly statistics
 * GET /api/stats/yearly
 */
export async function getYearlyStats(req, res, next) {
  try {
    const { year } = req.query;
    const now = new Date();
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();
    
    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59);
    
    const activities = await prisma.activity.findMany({
      where: {
        userId: req.userId,
        date: {
          gte: startOfYear,
          lte: endOfYear
        }
      },
      orderBy: { date: 'asc' }
    });
    
    // Group by month
    const monthlyData = {};
    const sportData = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.date);
      const monthKey = `${targetYear}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Monthly aggregation
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          activities: 0,
          minutes: 0,
          score: 0
        };
      }
      monthlyData[monthKey].activities++;
      monthlyData[monthKey].minutes += activity.duration;
      monthlyData[monthKey].score += activity.score;
      
      // Sport aggregation
      if (!sportData[activity.sportType]) {
        sportData[activity.sportType] = {
          sportType: activity.sportType,
          activities: 0,
          minutes: 0
        };
      }
      sportData[activity.sportType].activities++;
      sportData[activity.sportType].minutes += activity.duration;
    });
    
    // Calculate totals
    const totalMinutes = activities.reduce((sum, a) => sum + a.duration, 0);
    const totalScore = activities.reduce((sum, a) => sum + a.score, 0);
    const totalDistance = activities.reduce((sum, a) => sum + (a.distance || 0), 0);
    
    // Fill in missing months with zeros
    const allMonths = getLastPeriods('month', 12);
    const filledMonthlyData = allMonths.map(monthKey => ({
      month: monthKey,
      activities: monthlyData[monthKey]?.activities || 0,
      minutes: monthlyData[monthKey]?.minutes || 0,
      score: monthlyData[monthKey]?.score || 0
    }));
    
    res.json({
      success: true,
      data: {
        year: targetYear,
        summary: {
          totalActivities: activities.length,
          totalMinutes,
          totalScore,
          totalDistance: Math.round(totalDistance * 100) / 100,
          averageMinutesPerMonth: Math.round(totalMinutes / 12),
          activeMonths: Object.keys(monthlyData).length
        },
        monthlyData: filledMonthlyData,
        sportBreakdown: Object.values(sportData).sort((a, b) => b.minutes - a.minutes)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get notifications
 * GET /api/stats/notifications
 */
export async function getNotifications(req, res, next) {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const skip = (pageNum - 1) * limitNum;
    
    const where = {
      userId: req.userId,
      ...(unreadOnly === 'true' && { isRead: false })
    };
    
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: req.userId, isRead: false }
      })
    ]);
    
    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark notification as read
 * PATCH /api/stats/notifications/:id/read
 */
export async function markNotificationRead(req, res, next) {
  try {
    const { id } = req.params;
    
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.userId
      }
    });
    
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }
    
    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark all notifications as read
 * PATCH /api/stats/notifications/read-all
 */
export async function markAllNotificationsRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.userId,
        isRead: false
      },
      data: { isRead: true }
    });
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
}
