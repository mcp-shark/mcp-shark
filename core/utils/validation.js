/**
 * Input validation utilities
 * Provides common validation functions for controllers
 */

/**
 * Sanitize string input
 * @param {*} value - Value to sanitize
 * @returns {string|null} Sanitized string or null
 */
export function sanitizeString(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Validate and parse integer
 * @param {*} value - Value to parse
 * @param {number} [defaultValue] - Default value if invalid
 * @returns {number|null} Parsed integer or null/default
 */
export function parseInteger(value, defaultValue = null) {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Validate file path format
 * @param {string} filePath - File path to validate
 * @returns {boolean} True if path appears valid
 */
export function isValidFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return false;
  }
  // Basic validation - no null bytes, reasonable length
  if (filePath.includes('\0') || filePath.length > 4096) {
    return false;
  }
  return true;
}

/**
 * Validate array input
 * @param {*} value - Value to validate
 * @param {number} [minLength] - Minimum array length
 * @returns {boolean} True if valid array
 */
export function isValidArray(value, minLength = 0) {
  if (!Array.isArray(value)) {
    return false;
  }
  return value.length >= minLength;
}

/**
 * Validate required fields in object
 * @param {Object} obj - Object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {{valid: boolean, missing: string[]}} Validation result
 */
export function validateRequiredFields(obj, requiredFields) {
  if (!obj || typeof obj !== 'object') {
    return { valid: false, missing: requiredFields };
  }
  const missing = requiredFields.filter((field) => {
    const value = obj[field];
    return value === undefined || value === null || value === '';
  });
  return { valid: missing.length === 0, missing };
}
