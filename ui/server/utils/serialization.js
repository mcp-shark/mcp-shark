/**
 * Check if an object is a character code object (e.g., {"0":123,"1":34,...})
 * This is a bug format where JSON strings were incorrectly stored as character codes
 */
function isCharacterCodeObject(obj) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return false;
  }

  const keys = Object.keys(obj);
  if (keys.length === 0) {
    return false;
  }

  // Check if all keys are sequential numeric strings starting from "0"
  // and all values are numbers (character codes)
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] !== String(i)) {
      return false;
    }
    if (typeof obj[keys[i]] !== 'number') {
      return false;
    }
  }

  return true;
}

/**
 * Convert a character code object back to its original string
 */
function convertCharacterCodeObjectToString(obj) {
  const keys = Object.keys(obj).sort((a, b) => Number(a) - Number(b));
  const chars = keys.map((k) => String.fromCharCode(obj[k]));
  return chars.join('');
}

/**
 * Sanitize body fields that may contain character code objects from old bug
 */
function sanitizeBodyField(value) {
  if (typeof value === 'string') {
    // Check if the string is a JSON representation of a character code object
    try {
      const parsed = JSON.parse(value);
      if (isCharacterCodeObject(parsed)) {
        return convertCharacterCodeObjectToString(parsed);
      }
    } catch {
      // Not JSON, return as-is
    }
  }
  return value;
}

export function serializeBigInt(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize body_json and body_raw fields that may contain character code objects
      if (key === 'body_json' || key === 'body_raw') {
        result[key] = sanitizeBodyField(value);
      } else {
        result[key] = serializeBigInt(value);
      }
    }
    return result;
  }
  return obj;
}
