import prisma from '../config/database.js';
import { calculateScore } from '../utils/scoreCalculator.js';
import { ApiError } from '../middleware/errorHandler.js';
import { config } from '../config/index.js';

/**
 * Create a new activity
 * POST /api/activities
 */
export async function createActivity(req, res, next) {
  try {
    const { sportType, duration, date, intensity, distance, location, notes } = req.body;
    
    // Calculate score for the activity
    const score = calculateScore({ duration, intensity, sportType });
    
    // Create activity in a transaction
    const activity = await prisma.$transaction(async (tx) => {
      // Create the activity
      const newActivity = await tx.activity.create({
        data: {
          userId: req.userId,
          sportType,
          duration,
          date: new Date(date),
          intensity,
          distance: distance || null,
          location: location || null,
          notes: notes || null,
          score
        }
      });
      
      // Update user's total score
      const user = await tx.user.update({
        where: { id: req.userId },
        data: {
          totalScore: { increment: score },
          lastActiveAt: new Date()
        },
        select: {
          id: true,
          totalScore: true,
          level: true,
          streak: true
        }
      });
      
      // Check for level up (simple logic: every 100 points = level up)
      const newLevel = Math.floor(user.totalScore / 100) + 1;
      if (newLevel > user.level) {
        await tx.user.update({
          where: { id: req.userId },
          data: { level: newLevel }
        });
        
        // Create notification for level up
        await tx.notification.create({
          data: {
            userId: req.userId,
            type: 'ACHIEVEMENT',
            message: `🎉 Congratulations! You've reached level ${newLevel}!`
          }
        });
      }
      
      return { activity: newActivity, user };
    });
    
    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: {
        activity: {
          ...activity.activity,
          calories: Math.round(duration * (config.scoring.intensityMultipliers[intensity] || 1) * 5)
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all activities for the current user
 * GET /api/activities
 */
export async function getActivities(req, res, next) {
  try {
    const {
      page = 1,
      limit = config.pagination.defaultLimit,
      sportType,
      intensity,
      startDate,
      endDate,
      favorites,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), config.pagination.maxLimit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build where clause
    const where = {
      userId: req.userId
    };
    
    if (sportType) {
      where.sportType = sportType;
    }
    
    if (intensity) {
      where.intensity = intensity;
    }
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    if (favorites === 'true') {
      where.favoritedBy = {
        some: { userId: req.userId }
      };
    }
    
    // Build order by
    const orderBy = {};
    orderBy[sortBy] = sortOrder;
    
    // Get activities
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          favoritedBy: {
            where: { userId: req.userId },
            select: { id: true }
          }
        }
      }),
      prisma.activity.count({ where })
    ]);
    
    // Add isFavorite field
    const activitiesWithFavorite = activities.map(activity => ({
      ...activity,
      isFavorite: activity.favoritedBy.length > 0
    }));
    
    res.json({
      success: true,
      data: {
        activities: activitiesWithFavorite,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasMore: skip + limitNum < total
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single activity by ID
 * GET /api/activities/:id
 */
export async function getActivity(req, res, next) {
  try {
    const { id } = req.params;
    
    const activity = await prisma.activity.findFirst({
      where: {
        id,
        userId: req.userId
      },
      include: {
        favoritedBy: {
          where: { userId: req.userId },
          select: { id: true }
        }
      }
    });
    
    if (!activity) {
      throw new ApiError(404, 'Activity not found');
    }
    
    res.json({
      success: true,
      data: {
        activity: {
          ...activity,
          isFavorite: activity.favoritedBy.length > 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an activity
 * PUT /api/activities/:id
 */
export async function updateActivity(req, res, next) {
  try {
    const { id } = req.params;
    const { sportType, duration, date, intensity, distance, location, notes } = req.body;
    
    // Find existing activity
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id,
        userId: req.userId
      }
    });
    
    if (!existingActivity) {
      throw new ApiError(404, 'Activity not found');
    }
    
    // Calculate new score
    const newScore = calculateScore({
      duration: duration || existingActivity.duration,
      intensity: intensity || existingActivity.intensity,
      sportType: sportType || existingActivity.sportType
    });
    
    const scoreDifference = newScore - existingActivity.score;
    
    // Update activity in transaction
    await prisma.$transaction(async (tx) => {
      // Update the activity
      await tx.activity.update({
        where: { id },
        data: {
          ...(sportType && { sportType }),
          ...(duration && { duration }),
          ...(date && { date: new Date(date) }),
          ...(intensity && { intensity }),
          ...(distance !== undefined && { distance }),
          ...(location !== undefined && { location }),
          ...(notes !== undefined && { notes }),
          score: newScore
        }
      });
      
      // Update user's total score
      if (scoreDifference !== 0) {
        await tx.user.update({
          where: { id: req.userId },
          data: {
            totalScore: { increment: scoreDifference }
          }
        });
      }
    });
    
    // Get updated activity
    const updatedActivity = await prisma.activity.findUnique({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Activity updated successfully',
      data: { activity: updatedActivity }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an activity
 * DELETE /api/activities/:id
 */
export async function deleteActivity(req, res, next) {
  try {
    const { id } = req.params;
    
    // Find existing activity
    const activity = await prisma.activity.findFirst({
      where: {
        id,
        userId: req.userId
      }
    });
    
    if (!activity) {
      throw new ApiError(404, 'Activity not found');
    }
    
    // Delete activity in transaction
    await prisma.$transaction(async (tx) => {
      // Delete the activity
      await tx.activity.delete({
        where: { id }
      });
      
      // Update user's total score
      await tx.user.update({
        where: { id: req.userId },
        data: {
          totalScore: { decrement: activity.score }
        }
      });
    });
    
    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle favorite status for an activity
 * PATCH /api/activities/:id/favorite
 */
export async function toggleFavorite(req, res, next) {
  try {
    const { id } = req.params;
    const { isFavorite } = req.body;
    
    // Check if activity exists and belongs to user
    const activity = await prisma.activity.findFirst({
      where: {
        id,
        userId: req.userId
      },
      include: {
        favoritedBy: {
          where: { userId: req.userId }
        }
      }
    });
    
    if (!activity) {
      throw new ApiError(404, 'Activity not found');
    }
    
    const alreadyFavorited = activity.favoritedBy.length > 0;
    
    if (isFavorite && !alreadyFavorited) {
      // Add to favorites
      await prisma.favorite.create({
        data: {
          userId: req.userId,
          activityId: id
        }
      });
    } else if (!isFavorite && alreadyFavorited) {
      // Remove from favorites
      await prisma.favorite.deleteMany({
        where: {
          userId: req.userId,
          activityId: id
        }
      });
    }
    
    res.json({
      success: true,
      message: isFavorite ? 'Activity added to favorites' : 'Activity removed from favorites',
      data: { isFavorite }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get favorite activities
 * GET /api/activities/favorites
 */
export async function getFavorites(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), config.pagination.maxLimit);
    const skip = (pageNum - 1) * limitNum;
    
    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId: req.userId },
        include: {
          activity: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.favorite.count({
        where: { userId: req.userId }
      })
    ]);
    
    const activities = favorites.map(f => f.activity);
    
    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasMore: skip + limitNum < total
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get activity statistics
 * GET /api/activities/stats
 */
export async function getActivityStats(req, res, next) {
  try {
    const { period = 'month' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = null;
    }
    
    const where = {
      userId: req.userId,
      ...(startDate && {
        date: { gte: startDate }
      })
    };
    
    // Get aggregated stats
    const [totalMinutes, totalScore, totalDistance, sportBreakdown] = await Promise.all([
      prisma.activity.aggregate({
        where,
        _sum: { duration: true }
      }),
      prisma.activity.aggregate({
        where,
        _sum: { score: true }
      }),
      prisma.activity.aggregate({
        where: { ...where, distance: { not: null } },
        _sum: { distance: true }
      }),
      prisma.activity.groupBy({
        by: ['sportType'],
        where,
        _count: { sportType: true },
        orderBy: { _count: { sportType: 'desc' } }
      })
    ]);
    
    // Get most practiced sport
    const mostPracticed = sportBreakdown[0] || null;
    
    // Get activity count by date for chart
    const activitiesByDate = await prisma.activity.findMany({
      where,
      select: {
        date: true,
        duration: true,
        score: true
      },
      orderBy: { date: 'asc' }
    });
    
    // Group by day
    const dailyStats = activitiesByDate.reduce((acc, activity) => {
      const dateKey = new Date(activity.date).toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, count: 0, duration: 0, score: 0 };
      }
      acc[dateKey].count++;
      acc[dateKey].duration += activity.duration;
      acc[dateKey].score += activity.score;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        summary: {
          totalActivities: activitiesByDate.length,
          totalMinutes: totalMinutes._sum.duration || 0,
          totalScore: totalScore._sum.score || 0,
          totalDistance: Math.round((totalDistance._sum.distance || 0) * 100) / 100
        },
        mostPracticed: mostPracticed ? {
          sportType: mostPracticed.sportType,
          count: mostPracticed._count.sportType
        } : null,
        sportBreakdown: sportBreakdown.map(s => ({
          sportType: s.sportType,
          count: s._count.sportType
        })),
        dailyStats: Object.values(dailyStats)
      }
    });
  } catch (error) {
    next(error);
  }
}
