import { body, param, query, validationResult } from 'express-validator';

/**
 * Handle validation errors
 */
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
}

/**
 * Validation rules for user registration
 */
export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  handleValidationErrors
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Validation rules for activity creation
 */
export const createActivityValidation = [
  body('sportType')
    .isIn(['RUNNING', 'CYCLING', 'GYM', 'FOOTBALL', 'SWIMMING', 'YOGA', 'HIIT', 'WALKING', 'TENNIS', 'BASKETBALL', 'HIKING', 'DANCING', 'BOXING', 'OTHER'])
    .withMessage('Invalid sport type'),
  body('duration')
    .isInt({ min: 1, max: 1440 })
    .withMessage('Duration must be between 1 and 1440 minutes'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('intensity')
    .isIn(['LOW', 'MODERATE', 'HIGH', 'EXTREME'])
    .withMessage('Invalid intensity level'),
  body('distance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Distance must be a positive number'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  handleValidationErrors
];

/**
 * Validation rules for activity update
 */
export const updateActivityValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid activity ID'),
  body('sportType')
    .optional()
    .isIn(['RUNNING', 'CYCLING', 'GYM', 'FOOTBALL', 'SWIMMING', 'YOGA', 'HIIT', 'WALKING', 'TENNIS', 'BASKETBALL', 'HIKING', 'DANCING', 'BOXING', 'OTHER'])
    .withMessage('Invalid sport type'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 1440 })
    .withMessage('Duration must be between 1 and 1440 minutes'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('intensity')
    .optional()
    .isIn(['LOW', 'MODERATE', 'HIGH', 'EXTREME'])
    .withMessage('Invalid intensity level'),
  body('distance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Distance must be a positive number'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  body('isFavorite')
    .optional()
    .isBoolean()
    .withMessage('isFavorite must be a boolean'),
  handleValidationErrors
];

/**
 * Validation rules for activity ID parameter
 */
export const activityIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid activity ID'),
  handleValidationErrors
];

/**
 * Validation rules for list activities query
 */
export const listActivitiesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sportType')
    .optional()
    .isIn(['RUNNING', 'CYCLING', 'GYM', 'FOOTBALL', 'SWIMMING', 'YOGA', 'HIIT', 'WALKING', 'TENNIS', 'BASKETBALL', 'HIKING', 'DANCING', 'BOXING', 'OTHER'])
    .withMessage('Invalid sport type'),
  query('intensity')
    .optional()
    .isIn(['LOW', 'MODERATE', 'HIGH', 'EXTREME'])
    .withMessage('Invalid intensity'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('favorites')
    .optional()
    .isBoolean()
    .withMessage('favorites must be a boolean'),
  query('sortBy')
    .optional()
    .isIn(['date', 'duration', 'score', 'createdAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  handleValidationErrors
];

/**
 * Validation rules for leaderboard query
 */
export const leaderboardValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];
