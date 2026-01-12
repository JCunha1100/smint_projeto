import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { config } from '../config/index.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please provide a valid Bearer token'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          totalScore: true,
          level: true,
          createdAt: true
        }
      });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          message: 'User not found'
        });
      }
      
      req.user = user;
      req.userId = user.id;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          message: 'Please login again'
        });
      }
      
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Authentication failed'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Authentication check failed'
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, continues without error if not
 */
export async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          totalScore: true,
          level: true,
          createdAt: true
        }
      });
      
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    } catch (jwtError) {
      // Continue without authentication
    }
    
    next();
  } catch (error) {
    next();
  }
}

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn
    }
  );
}

/**
 * Verify password against hash
 * @param {string} password - Plain password
 * @param {string} hash - Password hash
 * @returns {boolean} True if password matches
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Hash password
 * @param {string} password - Plain password
 * @returns {string} Password hash
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, config.bcrypt.rounds);
}
