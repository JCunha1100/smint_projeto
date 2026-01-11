/**
 * Date utility functions for activity tracking
 */

/**
 * Format date to ISO string without time component
 * @param {Date} date - Date to format
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export function formatDateOnly(date) {
  return new Date(date).toISOString().split('T')[0];
}

/**
 * Get start of week for the given date
 * @param {Date} date - Reference date
 * @param {number} weekStartDay - Day of week to start (0 = Sunday, 1 = Monday)
 * @returns {Date} Start of week
 */
export function getStartOfWeek(date = new Date(), weekStartDay = 1) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 0) - (day < weekStartDay ? 7 : 0) + weekStartDay;
  return new Date(d.setDate(diff));
}

/**
 * Get end of week for the given date
 * @param {Date} date - Reference date
 * @param {number} weekStartDay - Day of week to start
 * @returns {Date} End of week
 */
export function getEndOfWeek(date = new Date(), weekStartDay = 1) {
  const start = getStartOfWeek(date, weekStartDay);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

/**
 * Get start of month for the given date
 * @param {Date} date - Reference date
 * @returns {Date} Start of month
 */
export function getStartOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get end of month for the given date
 * @param {Date} date - Reference date
 * @returns {Date} End of month
 */
export function getEndOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Get start of year for the given date
 * @param {Date} date - Reference date
 * @returns {Date} Start of year
 */
export function getStartOfYear(date = new Date()) {
  return new Date(date.getFullYear(), 0, 1);
}

/**
 * Get relative date string for common periods
 * @param {string} period - 'today', 'week', 'month', 'year'
 * @returns {Object} Object with startDate and endDate
 */
export function getDateRange(period) {
  const now = new Date();
  
  switch (period) {
    case 'today':
      return {
        startDate: new Date(now.setHours(0, 0, 0, 0)),
        endDate: new Date(now.setHours(23, 59, 59, 999))
      };
    case 'week':
      return {
        startDate: getStartOfWeek(now),
        endDate: getEndOfWeek(now)
      };
    case 'month':
      return {
        startDate: getStartOfMonth(now),
        endDate: getEndOfMonth(now)
      };
    case 'year':
      return {
        startDate: getStartOfYear(now),
        endDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      };
    default:
      return {
        startDate: null,
        endDate: null
      };
  }
}

/**
 * Format duration from minutes to human readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
}

/**
 * Calculate days between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Number of days between dates
 */
export function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round(Math.abs((d1 - d2) / oneDay));
}

/**
 * Check if a date is within the last N days
 * @param {Date} date - Date to check
 * @param {number} days - Number of days
 * @returns {boolean} True if date is within range
 */
export function isWithinDays(date, days) {
  const targetDate = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now - targetDate) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
}

/**
 * Group activities by time period
 * @param {Array} activities - Array of activities
 * @param {string} period - 'day', 'week', 'month'
 * @returns {Object} Activities grouped by time period
 */
export function groupByPeriod(activities, period = 'month') {
  return activities.reduce((groups, activity) => {
    const date = new Date(activity.date);
    let key;
    
    switch (period) {
      case 'day':
        key = formatDateOnly(date);
        break;
      case 'week':
        const weekStart = getStartOfWeek(date);
        key = formatDateOnly(weekStart);
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = formatDateOnly(date);
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(activity);
    
    return groups;
  }, {});
}

/**
 * Get last N periods as array
 * @param {string} period - 'day', 'week', 'month'
 * @param {number} count - Number of periods to return
 * @returns {Array} Array of period keys
 */
export function getLastPeriods(period, count = 12) {
  const periods = [];
  const now = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    let date = new Date(now);
    
    switch (period) {
      case 'day':
        date.setDate(date.getDate() - i);
        periods.push(formatDateOnly(date));
        break;
      case 'week':
        date = getStartOfWeek(date);
        date.setDate(date.getDate() - (i * 7));
        periods.push(formatDateOnly(date));
        break;
      case 'month':
        date.setMonth(date.getMonth() - i);
        periods.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
        break;
    }
  }
  
  return periods;
}
