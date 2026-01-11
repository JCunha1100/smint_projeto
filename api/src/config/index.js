import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10)
  },
  
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db'
  },
  
  // Scoring configuration
  scoring: {
    intensityMultipliers: {
      LOW: 1.0,
      MODERATE: 1.5,
      HIGH: 2.0,
      EXTREME: 2.5
    },
    sportWeights: {
      RUNNING: 1.2,
      CYCLING: 1.1,
      GYM: 1.0,
      FOOTBALL: 1.3,
      SWIMMING: 1.2,
      YOGA: 0.8,
      HIIT: 1.4,
      WALKING: 0.7,
      TENNIS: 1.2,
      BASKETBALL: 1.2,
      HIKING: 1.1,
      DANCING: 1.0,
      BOXING: 1.3,
      OTHER: 1.0
    }
  },
  
  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100
  }
};
