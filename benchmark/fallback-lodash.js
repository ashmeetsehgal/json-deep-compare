/**
 * Fallback implementation of lodash.isEqual
 * Simple deep equality check for benchmarking when lodash is not available
 */

function isEqual(value, other) {
  // Reference equality check
  if (value === other) return true;
  
  // Type check
  if (typeof value !== typeof other) return false;
  
  // Null/undefined check
  if (value == null || other == null) return value === other;
  
  // Primitive comparison
  if (typeof value !== 'object') return value === other;
  
  // Array comparison
  if (Array.isArray(value) && Array.isArray(other)) {
    if (value.length !== other.length) return false;
    for (let i = 0; i < value.length; i++) {
      if (!isEqual(value[i], other[i])) return false;
    }
    return true;
  }
  
  // Object comparison
  if (Array.isArray(value) || Array.isArray(other)) return false;
  
  const keys1 = Object.keys(value);
  const keys2 = Object.keys(other);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key) || !isEqual(value[key], other[key])) {
      return false;
    }
  }
  
  return true;
}

module.exports = isEqual;
