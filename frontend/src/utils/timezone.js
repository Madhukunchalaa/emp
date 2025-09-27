/**
 * Timezone utility functions for consistent IST (Indian Standard Time) formatting
 */

/**
 * Format a date/time to IST with consistent formatting
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted time string in IST
 */
export const formatToIST = (date, options = {}) => {
  if (!date) return 'Not recorded';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Time';
    }
    
    const defaultOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata',
      hour12: true,
      ...options
    };
    
    return dateObj.toLocaleTimeString('en-IN', defaultOptions);
  } catch (error) {
    console.error('Error formatting time to IST:', error, 'Value:', date);
    return 'Invalid Time';
  }
};

/**
 * Format a date to IST with consistent formatting
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string in IST
 */
export const formatDateToIST = (date, options = {}) => {
  if (!date) return 'Not recorded';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    const defaultOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Kolkata',
      ...options
    };
    
    return dateObj.toLocaleDateString('en-IN', defaultOptions);
  } catch (error) {
    console.error('Error formatting date to IST:', error, 'Value:', date);
    return 'Invalid Date';
  }
};

/**
 * Format a date/time to IST with both date and time
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date and time string in IST
 */
export const formatDateTimeToIST = (date, options = {}) => {
  if (!date) return 'Not recorded';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date/Time';
    }
    
    const defaultOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata',
      hour12: true,
      ...options
    };
    
    return dateObj.toLocaleString('en-IN', defaultOptions);
  } catch (error) {
    console.error('Error formatting date/time to IST:', error, 'Value:', date);
    return 'Invalid Date/Time';
  }
};

/**
 * Get current IST time
 * @returns {Date} Current time in IST
 */
export const getCurrentIST = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
};

/**
 * Convert any date to IST
 * @param {Date|string|number} date - The date to convert
 * @returns {Date} Date converted to IST
 */
export const convertToIST = (date) => {
  if (!date) return null;
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return null;
    }
    
    return new Date(dateObj.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  } catch (error) {
    console.error('Error converting to IST:', error, 'Value:', date);
    return null;
  }
};

/**
 * Check if a time is in IST timezone
 * @param {Date|string|number} date - The date to check
 * @returns {boolean} True if the date is in IST
 */
export const isIST = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return false;
    }
    
    // Check if the timezone offset matches IST (UTC+5:30)
    const istOffset = 5.5 * 60; // IST is UTC+5:30
    const dateOffset = dateObj.getTimezoneOffset();
    
    // Convert to minutes and compare
    return Math.abs(dateOffset + istOffset) < 1; // Allow 1 minute tolerance
  } catch (error) {
    console.error('Error checking IST timezone:', error, 'Value:', date);
    return false;
  }
};
