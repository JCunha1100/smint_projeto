import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { calculateScore } from '../utils/scoreCalculator.js';

const prisma = new PrismaClient();

/**
 * Seed database with sample data
 */
async function main() {
  console.log('🌱 Starting database seed...');
  
  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('🗑️  Cleaned existing data');
  
  // Create sample users
  const password = await bcrypt.hash('password123', 12);
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john@example.com',
        password,
        name: 'John Doe',
        totalScore: 2450,
        level: 24,
        streak: 7
      }
    }),
    prisma.user.create({
      data: {
        email: 'jane@example.com',
        password,
        name: 'Jane Smith',
        totalScore: 3120,
        level: 31,
        streak: 14
      }
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        password,
        name: 'Bob Wilson',
        totalScore: 1890,
        level: 18,
        streak: 3
      }
    }),
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        password,
        name: 'Alice Johnson',
        totalScore: 4200,
        level: 42,
        streak: 21
      }
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        password,
        name: 'Charlie Brown',
        totalScore: 980,
        level: 9,
        streak: 0
      }
    })
  ]);
  
  console.log('👤 Created 5 sample users');
  
  // Sample activities for John
  const johnActivities = [
    { sportType: 'RUNNING', duration: 30, intensity: 'HIGH', date: new Date('2024-01-15'), location: 'Central Park', distance: 5.2 },
    { sportType: 'GYM', duration: 60, intensity: 'MODERATE', date: new Date('2024-01-14'), location: 'Gold Gym' },
    { sportType: 'CYCLING', duration: 45, intensity: 'MODERATE', date: new Date('2024-01-13'), location: 'City Bike Path', distance: 15.3 },
    { sportType: 'HIIT', duration: 30, intensity: 'HIGH', date: new Date('2024-01-12'), location: 'Home' },
    { sportType: 'SWIMMING', duration: 40, intensity: 'MODERATE', date: new Date('2024-01-11'), location: 'Community Pool' },
    { sportType: 'RUNNING', duration: 45, intensity: 'HIGH', date: new Date('2024-01-10'), location: 'Riverside Trail', distance: 7.5 },
    { sportType: 'YOGA', duration: 30, intensity: 'LOW', date: new Date('2024-01-09'), location: 'Home' },
    { sportType: 'FOOTBALL', duration: 90, intensity: 'HIGH', date: new Date('2024-01-08'), location: 'Sports Complex' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-01-07'), location: 'Gold Gym' },
    { sportType: 'RUNNING', duration: 35, intensity: 'MODERATE', date: new Date('2024-01-06'), location: 'Neighborhood', distance: 5.8 }
  ];
  
  // Sample activities for Jane
  const janeActivities = [
    { sportType: 'RUNNING', duration: 60, intensity: 'HIGH', date: new Date('2024-01-15'), location: 'Marathon Trail', distance: 10.5 },
    { sportType: 'CYCLING', duration: 90, intensity: 'HIGH', date: new Date('2024-01-14'), location: 'Mountain Bike Trail', distance: 35.2 },
    { sportType: 'SWIMMING', duration: 60, intensity: 'MODERATE', date: new Date('2024-01-13'), location: 'Olympic Pool' },
    { sportType: 'HIIT', duration: 45, intensity: 'EXTREME', date: new Date('2024-01-12'), location: 'CrossFit Gym' },
    { sportType: 'GYM', duration: 75, intensity: 'HIGH', date: new Date('2024-01-11'), location: 'Power Gym' },
    { sportType: 'RUNNING', duration: 50, intensity: 'HIGH', date: new Date('2024-01-10'), location: 'Forest Trail', distance: 8.2 },
    { sportType: 'TENNIS', duration: 120, intensity: 'MODERATE', date: new Date('2024-01-09'), location: 'Tennis Club' },
    { sportType: 'BOXING', duration: 60, intensity: 'HIGH', date: new Date('2024-01-08'), location: 'Boxing Gym' },
    { sportType: 'CYCLING', duration: 120, intensity: 'HIGH', date: new Date('2024-01-07'), location: 'Coastal Road', distance: 45.0 },
    { sportType: 'RUNNING', duration: 40, intensity: 'MODERATE', date: new Date('2024-01-06'), location: 'Lake Path', distance: 6.5 }
  ];
  
  // Create activities for all users
  const activityData = [
    { userIndex: 0, activities: johnActivities },
    { userIndex: 1, activities: janeActivities },
    { userIndex: 2, activities: johnActivities.slice(0, 5) },
    { userIndex: 3, activities: janeActivities },
    { userIndex: 4, activities: johnActivities.slice(0, 3) }
  ];
  
  for (const { userIndex, activities } of activityData) {
    const user = users[userIndex];
    
    for (const activity of activities) {
      const score = calculateScore({
        duration: activity.duration,
        intensity: activity.intensity,
        sportType: activity.sportType
      });
      
      await prisma.activity.create({
        data: {
          userId: user.id,
          sportType: activity.sportType,
          duration: activity.duration,
          intensity: activity.intensity,
          date: activity.date,
          location: activity.location,
          distance: activity.distance || null,
          notes: null,
          score
        }
      });
    }
  }
  
  console.log('🏃 Created sample activities for all users');
  
  // Create some favorites
  await prisma.favorite.create({
    data: {
      userId: users[0].id,
      activityId: (await prisma.activity.findFirst({ where: { userId: users[0].id } })).id
    }
  });
  
  console.log('⭐ Created sample favorites');
  
  // Create notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: 'ACHIEVEMENT',
        message: '🎉 Congratulations! You\'ve reached level 24!',
        isRead: false
      }
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: 'MILESTONE',
        message: '🏆 You\'ve completed 100 activities this year!',
        isRead: false
      }
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: 'REMINDER',
        message: '💪 Don\'t forget your workout today!',
        isRead: true
      }
    })
  ]);
  
  console.log('🔔 Created sample notifications');
  
  console.log('✅ Database seed completed successfully!');
  console.log('\n📝 Sample accounts:');
  console.log('   Email: john@example.com | Password: password123');
  console.log('   Email: jane@example.com | Password: password123');
  console.log('   Email: bob@example.com  | Password: password123');
  console.log('   Email: alice@example.com | Password: password123');
  console.log('   Email: charlie@example.com | Password: password123');
}

// Run seed
main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
