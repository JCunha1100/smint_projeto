import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { leaderboardValidation } from '../middleware/validation.js';
import {
  getLeaderboard,
  getDashboard,
  getWeeklySummary,
  getMonthlySummary,
  getYearlyStats,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/statsController.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Dashboard and stats
router.get('/dashboard', getDashboard);
router.get('/leaderboard', leaderboardValidation, getLeaderboard);
router.get('/weekly', getWeeklySummary);
router.get('/monthly', getMonthlySummary);
router.get('/yearly', getYearlyStats);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markAllNotificationsRead);
router.patch('/notifications/:id/read', markNotificationRead);

export default router;
