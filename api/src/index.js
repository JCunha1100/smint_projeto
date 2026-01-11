import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { config } from './config/index.js';
import { testConnection } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'FitTrack API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/stats', statsRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'FitTrack API Documentation',
    version: '1.0.0',
    endpoints: {
      authentication: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/me': 'Get current user profile',
        'PUT /api/auth/me': 'Update user profile',
        'PUT /api/auth/password': 'Change password',
        'DELETE /api/auth/me': 'Delete account',
        'POST /api/auth/refresh': 'Refresh token'
      },
      activities: {
        'POST /api/activities': 'Create new activity',
        'GET /api/activities': 'List user activities',
        'GET /api/activities/stats': 'Get activity statistics',
        'GET /api/activities/favorites': 'Get favorite activities',
        'GET /api/activities/:id': 'Get single activity',
        'PUT /api/activities/:id': 'Update activity',
        'DELETE /api/activities/:id': 'Delete activity',
        'PATCH /api/activities/:id/favorite': 'Toggle favorite'
      },
      statistics: {
        'GET /api/stats/dashboard': 'Get dashboard data',
        'GET /api/stats/leaderboard': 'Get leaderboard rankings',
        'GET /api/stats/weekly': 'Get weekly summary',
        'GET /api/stats/monthly': 'Get monthly summary',
        'GET /api/stats/yearly': 'Get yearly statistics',
        'GET /api/stats/notifications': 'Get notifications',
        'PATCH /api/stats/notifications/read-all': 'Mark all as read',
        'PATCH /api/stats/notifications/:id/read': 'Mark one as read'
      }
    }
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
  // Test database connection
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error('Failed to connect to database. Exiting...');
    process.exit(1);
  }
  
  app.listen(config.port, () => {
    console.log(`
    ╔═══════════════════════════════════════════════╗
    ║                                               ║
    ║   🏃 FitTrack API Server                      ║
    ║                                               ║
    ║   Environment: ${config.nodeEnv.padEnd(28)}║
    ║   Port: ${config.port.toString().padEnd(33)}║
    ║                                               ║
    ║   API Documentation: http://localhost:${config.port}/api
    ║   Health Check: http://localhost:${config.port}/health
    ║                                               ║
    ╚═══════════════════════════════════════════════╝
    `);
  });
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;
