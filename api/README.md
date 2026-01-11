# FitTrack API

A comprehensive Node.js Express backend for a fitness tracking application with gamification features, scoring system, and leaderboard.

## Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Activity Management**: Complete CRUD operations for tracking workouts
- **Sport Types**: Running, Cycling, Gym, Football, Swimming, Yoga, HIIT, Walking, Tennis, Basketball, Hiking, Dancing, Boxing, Other
- **Intensity Levels**: Low, Moderate, High, Extreme

### Gamification
- **Scoring System**: Points calculated based on duration, intensity, and sport type
- **Leveling**: Users level up as they accumulate points
- **Streak Tracking**: Track consecutive days of activity
- **Leaderboard**: Global rankings among all users
- **Achievements**: Unlockable badges based on activity milestones

### Statistics & Analytics
- **Dashboard**: Overview of user's fitness journey
- **Weekly Summary**: Activity breakdown for the past week
- **Monthly Summary**: Detailed monthly statistics
- **Yearly Statistics**: Annual progress tracking
- **Sport Breakdown**: Analytics by sport type

### Additional Features
- **Favorites**: Mark activities as favorites for quick access
- **Filtering & Sorting**: Filter by sport, intensity, date range; sort by date, duration, score
- **Notifications**: Achievement alerts and reminders
- **Pagination**: Efficient data loading for large datasets

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Logging**: morgan

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd fittrack-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the database**
   ```bash
   npm run prisma:migrate
   ```

5. **Seed sample data (optional)**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "totalScore": 0,
      "level": 1
    },
    "token": "jwt_token_here"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "totalScore": 1250,
      "level": 12
    },
    "token": "jwt_token_here"
  }
}
```

### Activity Endpoints

All activity endpoints require the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

#### Create Activity
```http
POST /activities
Content-Type: application/json

{
  "sportType": "RUNNING",
  "duration": 30,
  "date": "2024-01-15T08:00:00Z",
  "intensity": "HIGH",
  "location": "Central Park",
  "distance": 5.2,
  "notes": "Great morning run!"
}
```

**Valid sport types**: `RUNNING`, `CYCLING`, `GYM`, `FOOTBALL`, `SWIMMING`, `YOGA`, `HIIT`, `WALKING`, `TENNIS`, `BASKETBALL`, `HIKING`, `DANCING`, `BOXING`, `OTHER`

**Valid intensity levels**: `LOW`, `MODERATE`, `HIGH`, `EXTREME`

**Response (201 Created)**
```json
{
  "success": true,
  "message": "Activity created successfully",
  "data": {
    "activity": {
      "id": "uuid",
      "sportType": "RUNNING",
      "duration": 30,
      "date": "2024-01-15T08:00:00Z",
      "intensity": "HIGH",
      "location": "Central Park",
      "distance": 5.2,
      "notes": "Great morning run!",
      "score": 72,
      "calories": 300,
      "isFavorite": false
    }
  }
}
```

#### List Activities
```http
GET /activities?page=1&limit=20&sportType=RUNNING&sortBy=date&sortOrder=desc
```

**Query Parameters**:
- `page` (default: 1) - Page number
- `limit` (default: 20, max: 100) - Items per page
- `sportType` - Filter by sport type
- `intensity` - Filter by intensity
- `startDate` - Filter activities from date (ISO 8601)
- `endDate` - Filter activities until date (ISO 8601)
- `favorites` - Filter to favorites only (true/false)
- `sortBy` - Sort field: `date`, `duration`, `score`, `createdAt`
- `sortOrder` - Sort order: `asc`, `desc`

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "uuid",
        "sportType": "RUNNING",
        "duration": 30,
        "date": "2024-01-15T08:00:00Z",
        "intensity": "HIGH",
        "location": "Central Park",
        "distance": 5.2,
        "score": 72,
        "isFavorite": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasMore": true
    }
  }
}
```

#### Get Single Activity
```http
GET /activities/:id
```

#### Update Activity
```http
PUT /activities/:id
Content-Type: application/json

{
  "duration": 45,
  "intensity": "EXTREME"
}
```

#### Delete Activity
```http
DELETE /activities/:id
```

#### Toggle Favorite
```http
PATCH /activities/:id/favorite
Content-Type: application/json

{
  "isFavorite": true
}
```

#### Get Activity Statistics
```http
GET /activities/stats?period=month
```

**Period options**: `week`, `month`, `year`

### Statistics Endpoints

#### Dashboard
```http
GET /stats/dashboard
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "totalScore": 1250,
      "level": 12,
      "levelProgress": 50,
      "streak": 7
    },
    "summary": {
      "totalActivities": 45,
      "totalMinutes": 2250,
      "totalDistance": 125.5,
      "averageScorePerActivity": 27.8
    },
    "monthly": {
      "activities": 15,
      "minutes": 750,
      "score": 420
    },
    "weekly": {
      "activities": 5,
      "minutes": 250,
      "score": 140
    },
    "recentActivities": [...],
    "sportBreakdown": [...],
    "achievements": [...]
  }
}
```

#### Leaderboard
```http
GET /stats/leaderboard?page=1&limit=50
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "id": "uuid",
        "name": "Alice Johnson",
        "totalScore": 4200,
        "level": 42,
        "activitiesCount": 150,
        "streak": 21
      },
      {
        "rank": 2,
        "id": "uuid",
        "name": "Jane Smith",
        "totalScore": 3120,
        "level": 31,
        "activitiesCount": 120,
        "streak": 14
      }
    ],
    "currentUser": {
      "rank": 3,
      "percentile": 40,
      "isInTopList": true
    },
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
}
```

#### Weekly Summary
```http
GET /stats/weekly
```

#### Monthly Summary
```http
GET /stats/monthly?month=1&year=2024
```

#### Yearly Statistics
```http
GET /stats/yearly?year=2024
```

#### Notifications
```http
GET /stats/notifications
PATCH /stats/notifications/:id/read
PATCH /stats/notifications/read-all
```

## Scoring System

### Formula
```
Score = Duration (minutes) × Intensity Multiplier × Sport Weight
```

### Intensity Multipliers
| Intensity | Multiplier |
|-----------|------------|
| LOW | 1.0 |
| MODERATE | 1.5 |
| HIGH | 2.0 |
| EXTREME | 2.5 |

### Sport Weights
| Sport | Weight |
|-------|--------|
| HIIT | 1.4 |
| FOOTBALL | 1.3 |
| BOXING | 1.3 |
| RUNNING | 1.2 |
| SWIMMING | 1.2 |
| TENNIS | 1.2 |
| BASKETBALL | 1.2 |
| CYCLING | 1.1 |
| HIKING | 1.1 |
| GYM | 1.0 |
| DANCING | 1.0 |
| OTHER | 1.0 |
| YOGA | 0.8 |
| WALKING | 0.7 |

### Example Calculation
30 minutes of HIGH intensity RUNNING:
```
Score = 30 × 2.0 (HIGH) × 1.2 (RUNNING) = 72 points
```

## Leveling System

Levels are calculated based on total accumulated score:
- Level 1: 0-99 points
- Level 2: 100-249 points
- Level 3: 250-499 points
- And so on...

Each level requires exponentially more points than the previous.

## Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# BCRYPT Configuration
BCRYPT_ROUNDS=12
```

## Project Structure

```
fittrack-api/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.js            # Database seeding
│   └── dev.db             # SQLite database file
├── src/
│   ├── config/
│   │   ├── index.js       # Configuration
│   │   └── database.js    # Prisma client
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── activityController.js
│   │   └── statsController.js
│   ├── middleware/
│   │   ├── auth.js        # JWT authentication
│   │   ├── validation.js  # Request validation
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── activityRoutes.js
│   │   └── statsRoutes.js
│   ├── utils/
│   │   ├── scoreCalculator.js
│   │   └── dateUtils.js
│   └── index.js           # Entry point
├── package.json
├── .env
└── README.md
```

## Scripts

```bash
# Development
npm run dev           # Start development server with nodemon

# Database
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run database migrations
npm run prisma:studio     # Open Prisma Studio
npm run seed              # Seed database with sample data

# Production
npm start            # Start production server
```

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid or missing token)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

## License

MIT License
