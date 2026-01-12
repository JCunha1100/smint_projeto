import prisma from '../config/database.js';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

/**
 * Error handler middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  // Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'A record with this value already exists',
          field: err.meta?.target
        });
      case 'P2025':
        // Record not found
        return res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'The requested resource was not found'
        });
      default:
        // Other Prisma errors
        return res.status(500).json({
          success: false,
          error: 'Database error',
          message: 'An error occurred while processing your request'
        });
    }
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'Authentication token is invalid'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      message: 'Your session has expired. Please login again.'
    });
  }
  
  // Operational errors (known errors)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details
    });
  }
  
  // Unexpected errors
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An unexpected error occurred'
  });
}

/**
 * Not found handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
}

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create error response helper
 */
export function createErrorResponse(res, statusCode, message, details = null) {
  return res.status(statusCode).json({
    success: false,
    error: message,
    details
  });
}

/**
 * Create success response helper
 */
export function createSuccessResponse(res, statusCode, data, message = null) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
}

/**
 * Paginated response helper
 */
export function paginatedResponse(res, data, pagination) {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasMore: pagination.page * pagination.limit < pagination.total
    }
  });
}
