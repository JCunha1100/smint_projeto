import { config } from '../config/index.js';

/**
 * Calculate the score for an activity based on duration, intensity, and sport type
 * Formula: Score = Duration × Intensity Multiplier × Sport Weight
 * 
 * @param {Object} activityData - Activity data
 * @param {number} activityData.duration - Duration in minutes
 * @param {string} activityData.intensity - Intensity level
 * @param {string} activityData.sportType - Type of sport
 * @returns {number} Calculated score
 */
export function calculateScore({ duration, intensity, sportType }) {
  const intensityMultiplier = config.scoring.intensityMultipliers[intensity] || 1.0;
  const sportWeight = config.scoring.sportWeights[sportType] || 1.0;
  
  const score = duration * intensityMultiplier * sportWeight;
  
  // Round to 2 decimal places
  return Math.round(score * 100) / 100;
}

/**
 * Calculate calories burned (rough estimation)
 * Formula: Calories = MET × weight (kg) × duration (hours)
 * MET values based on sport type and intensity
 * 
 * @param {Object} activityData - Activity data
 * @returns {number} Estimated calories burned
 */
export function calculateCalories({ sportType, intensity, duration, weight = 70 }) {
  // MET (Metabolic Equivalent of Task) values
  const metValues = {
    RUNNING: { LOW: 6.0, MODERATE: 8.0, HIGH: 11.5, EXTREME: 14.0 },
    CYCLING: { LOW: 4.0, MODERATE: 6.0, HIGH: 8.0, EXTREME: 10.0 },
    GYM: { LOW: 3.0, MODERATE: 5.0, HIGH: 7.0, EXTREME: 9.0 },
    FOOTBALL: { LOW: 5.0, MODERATE: 7.0, HIGH: 9.0, EXTREME: 11.0 },
    SWIMMING: { LOW: 5.0, MODERATE: 7.0, HIGH: 9.0, EXTREME: 12.0 },
    YOGA: { LOW: 2.0, MODERATE: 3.0, HIGH: 4.0, EXTREME: 5.0 },
    HIIT: { LOW: 6.0, MODERATE: 10.0, HIGH: 14.0, EXTREME: 18.0 },
    WALKING: { LOW: 2.5, MODERATE: 3.5, HIGH: 4.5, EXTREME: 5.5 },
    TENNIS: { LOW: 4.0, MODERATE: 6.0, HIGH: 8.0, EXTREME: 10.0 },
    BASKETBALL: { LOW: 4.0, MODERATE: 6.0, HIGH: 8.0, EXTREME: 10.0 },
    HIKING: { LOW: 4.0, MODERATE: 6.0, HIGH: 8.0, EXTREME: 10.0 },
    DANCING: { LOW: 3.0, MODERATE: 5.0, HIGH: 7.0, EXTREME: 9.0 },
    BOXING: { LOW: 5.0, MODERATE: 8.0, HIGH: 11.0, EXTREME: 14.0 },
    OTHER: { LOW: 3.0, MODERATE: 5.0, HIGH: 7.0, EXTREME: 9.0 }
  };
  
  const met = metValues[sportType]?.[intensity] || 5.0;
  const durationHours = duration / 60;
  
  // Calories = MET × weight (kg) × duration (hours)
  const calories = met * weight * durationHours;
  
  return Math.round(calories);
}

/**
 * Calculate level based on total score
 * Level increases exponentially as score grows
 * 
 * @param {number} totalScore - User's total score
 * @returns {Object} Level info with current level, progress, and next level requirement
 */
export function calculateLevel(totalScore) {
  // Level thresholds (each level requires more points)
  const baseExp = 100;
  const expMultiplier = 1.5;
  
  let currentLevel = 1;
  let expForCurrentLevel = 0;
  let expForNextLevel = baseExp;
  let totalExpRequired = 0;
  
  while (totalExpRequired + expForNextLevel <= totalScore) {
    totalExpRequired += expForNextLevel;
    currentLevel++;
    expForNextLevel = Math.round(baseExp * Math.pow(expMultiplier, currentLevel - 1));
  }
  
  const currentLevelExp = totalScore - totalExpRequired;
  const progress = Math.round((currentLevelExp / expForNextLevel) * 100);
  
  return {
    level: currentLevel,
    currentExp: currentLevelExp,
    expForNextLevel,
    progress: Math.min(progress, 100)
  };
}

/**
 * Get achievement badges based on activity history
 * 
 * @param {Array} activities - Array of user activities
 * @returns {Array} List of earned achievements
 */
export function getAchievements(activities) {
  const achievements = [];
  const totalActivities = activities.length;
  
  // Total activities achievements
  if (totalActivities >= 1) achievements.push({ id: 'first_workout', name: 'First Steps', description: 'Complete your first workout' });
  if (totalActivities >= 10) achievements.push({ id: 'getting_started', name: 'Getting Started', description: 'Complete 10 workouts' });
  if (totalActivities >= 50) achievements.push({ id: 'dedicated', name: 'Dedicated Athlete', description: 'Complete 50 workouts' });
  if (totalActivities >= 100) achievements.push({ id: 'century', name: 'Century Club', description: 'Complete 100 workouts' });
  if (totalActivities >= 365) achievements.push({ id: 'daily_athlete', name: 'Daily Athlete', description: 'Complete 365 workouts' });
  
  // Streak achievements
  const today = new Date();
  const activityDates = [...new Set(activities.map(a => new Date(a.date).toDateString()))];
  let maxStreak = 0;
  let currentStreak = 0;
  
  // Simple streak calculation
  activityDates.sort((a, b) => new Date(b) - new Date(a));
  for (let i = 0; i < activityDates.length; i++) {
    const date = new Date(activityDates[i]);
    const prevDate = new Date(today);
    prevDate.setDate(prevDate.getDate() - i);
    
    if (date.toDateString() === prevDate.toDateString()) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      break;
    }
  }
  
  if (currentStreak >= 3) achievements.push({ id: 'streak_3', name: 'On Fire', description: '3 day streak' });
  if (currentStreak >= 7) achievements.push({ id: 'streak_7', name: 'Week Warrior', description: '7 day streak' });
  if (currentStreak >= 30) achievements.push({ id: 'streak_30', name: 'Monthly Master', description: '30 day streak' });
  
  // Sport-specific achievements
  const sportCounts = activities.reduce((acc, a) => {
    acc[a.sportType] = (acc[a.sportType] || 0) + 1;
    return acc;
  }, {});
  
  Object.entries(sportCounts).forEach(([sport, count]) => {
    if (count >= 10) achievements.push({ id: `${sport.toLowerCase()}_expert`, name: `${sport} Expert`, description: `Complete 10 ${sport.toLowerCase()} sessions` });
  });
  
  return achievements;
}
