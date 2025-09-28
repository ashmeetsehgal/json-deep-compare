/**
 * Fallback implementation of deep-equal
 * Simple deep equality check for benchmarking when deep-equal is not available
 */

function deepEqual(a, b) {
  // Reference equality check
  if (a === b) return true;
  
  // Type check
  if (typeof a !== typeof b) return false;
  
  // Null/undefined check
  if (a == null || b == null) return a === b;
  
  // Primitive comparison
  if (typeof a !== 'object') return a === b;
  
  // Array comparison
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  // Object comparison
  if (Array.isArray(a) || Array.isArray(b)) return false;
  
  const keys1 = Object.keys(a);
  const keys2 = Object.keys(b);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }
  
  return true;
}

module.exports = deepEqual;
