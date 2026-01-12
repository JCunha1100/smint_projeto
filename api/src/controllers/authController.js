import prisma from '../config/database.js';
import { generateToken, hashPassword, verifyPassword } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0]
      },
      select: {
        id: true,
        email: true,
        name: true,
        totalScore: true,
        level: true,
        createdAt: true
      }
    });
    
    // Generate token
    const token = generateToken(user);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.password);
    
    if (!isValid) {
      throw new ApiError(401, 'Invalid email or password');
    }
    
    // Generate token
    const token = generateToken(user);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          totalScore: user.totalScore,
          level: user.level
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
export async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        totalScore: true,
        level: true,
        streak: true,
        createdAt: true,
        _count: {
          select: {
            activities: true,
            favorites: true
          }
        }
      }
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user profile
 * PUT /api/auth/me
 */
export async function updateProfile(req, res, next) {
  try {
    const { name, avatar } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(avatar !== undefined && { avatar })
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        totalScore: true,
        level: true,
        streak: true,
        createdAt: true
      }
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Change password
 * PUT /api/auth/password
 */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.password);
    
    if (!isValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword }
    });
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete account
 * DELETE /api/auth/me
 */
export async function deleteAccount(req, res, next) {
  try {
    const { password } = req.body;
    
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.password);
    
    if (!isValid) {
      throw new ApiError(401, 'Password is incorrect');
    }
    
    // Delete user (cascades to activities and notifications)
    await prisma.user.delete({
      where: { id: req.userId }
    });
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh token
 * POST /api/auth/refresh
 */
export async function refreshToken(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    const token = generateToken(user);
    
    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    next(error);
  }
}
