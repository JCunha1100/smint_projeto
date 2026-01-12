import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createActivityValidation,
  updateActivityValidation,
  activityIdValidation,
  listActivitiesValidation
} from '../middleware/validation.js';
import {
  createActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  toggleFavorite,
  getFavorites,
  getActivityStats
} from '../controllers/activityController.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Activity CRUD operations
router.post('/', createActivityValidation, createActivity);
router.get('/', listActivitiesValidation, getActivities);
router.get('/stats', getActivityStats);
router.get('/favorites', getFavorites);
router.get('/:id', activityIdValidation, getActivity);
router.put('/:id', updateActivityValidation, updateActivity);
router.delete('/:id', activityIdValidation, deleteActivity);

// Favorite operations
router.patch('/:id/favorite', activityIdValidation, toggleFavorite);

export default router;
