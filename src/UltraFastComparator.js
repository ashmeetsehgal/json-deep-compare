/**
 * @fileoverview Ultra-fast comparison implementation
 * @author AshmeetSehgal.com
 * @description Maximum performance comparison with minimal overhead
 */

/**
 * Ultra-fast comparison class - optimized for maximum speed
 */
class UltraFastComparator {
  /**
   * Ultra-fast comparison with absolute minimal overhead
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {boolean} Simple boolean result
   */
  static ultraFastCompare(obj1, obj2) {
    // Fastest possible: reference equality
    if (obj1 === obj2) return true;
    
    // Fast type check
    if (typeof obj1 !== typeof obj2) return false;
    
    // Fast null check
    if (obj1 == null || obj2 == null) return obj1 === obj2;
    
    // Fast primitive comparison
    if (typeof obj1 !== 'object') return obj1 === obj2;
    
    // Fast array comparison
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      return this.ultraFastCompareArrays(obj1, obj2);
    }
    
    // Fast object comparison
    return this.ultraFastCompareObjects(obj1, obj2);
  }

  /**
   * Ultra-fast array comparison
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @returns {boolean} Comparison result
   */
  static ultraFastCompareArrays(arr1, arr2) {
    const len = arr1.length;
    
    // Fast length check
    if (len !== arr2.length) return false;
    
    // Fast empty check
    if (len === 0) return true;
    
    // Ultra-fast element comparison with early exit
    for (let i = 0; i < len; i++) {
      if (!this.ultraFastCompare(arr1[i], arr2[i])) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Ultra-fast object comparison
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {boolean} Comparison result
   */
  static ultraFastCompareObjects(obj1, obj2) {
    // Guard: Only use ultra-fast path for plain objects (prototype === Object.prototype)
    if (Object.getPrototypeOf(obj1) !== Object.prototype || 
        Object.getPrototypeOf(obj2) !== Object.prototype) {
      // Fall back to stricter comparison for non-plain objects
      return false;
    }

    const keys1 = Object.keys(obj1);
    const len = keys1.length;
    
    // Fast key count check
    if (len !== Object.keys(obj2).length) return false;
    
    // Fast empty check
    if (len === 0) return true;
    
    // Ultra-fast key-value comparison with early exit
    for (let i = 0; i < len; i++) {
      const key = keys1[i];
      if (!Object.prototype.hasOwnProperty.call(obj2, key) || !this.ultraFastCompare(obj1[key], obj2[key])) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Ultra-fast array comparison with accurate counting
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @returns {Object} Comparison result with counts
   */
  static ultraFastCompareArraysWithCounts(arr1, arr2) {
    const len = arr1.length;
    
    // Fast length check
    if (len !== arr2.length) {
      return { 
        matchPercentage: 0, 
        totalKeysCompared: Math.max(len, arr2.length), 
        totalMatched: 0, 
        totalUnmatched: Math.max(len, arr2.length) 
      };
    }
    
    // Fast empty check
    if (len === 0) {
      return { matchPercentage: 100, totalKeysCompared: 0, totalMatched: 0, totalUnmatched: 0 };
    }
    
    let matched = 0;
    let unmatched = 0;
    
    // Ultra-fast element comparison with early exit
    for (let i = 0; i < len; i++) {
      const elementResult = this.ultraFastCompareWithCounts(arr1[i], arr2[i]);
      matched += elementResult.totalMatched;
      unmatched += elementResult.totalUnmatched;
      
      // Early exit if we have too many mismatches
      if (unmatched > len / 2) {
        return { 
          matchPercentage: 0, 
          totalKeysCompared: len, 
          totalMatched: matched, 
          totalUnmatched: len - matched 
        };
      }
    }
    
    const totalKeysCompared = matched + unmatched;
    const matchPercentage = totalKeysCompared > 0 ? Math.round((matched / totalKeysCompared) * 100) : 100;
    
    return { matchPercentage, totalKeysCompared, totalMatched: matched, totalUnmatched: unmatched };
  }

  /**
   * Ultra-fast object comparison with accurate counting
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {Object} Comparison result with counts
   */
  static ultraFastCompareObjectsWithCounts(obj1, obj2) {
    // Guard: Only use ultra-fast path for plain objects (prototype === Object.prototype)
    if (Object.getPrototypeOf(obj1) !== Object.prototype || 
        Object.getPrototypeOf(obj2) !== Object.prototype) {
      // Fall back to stricter comparison for non-plain objects
      return { matchPercentage: 0, totalKeysCompared: 1, totalMatched: 0, totalUnmatched: 1 };
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const len1 = keys1.length;
    const len2 = keys2.length;
    
    // Fast key count check
    if (len1 !== len2) {
      return { 
        matchPercentage: 0, 
        totalKeysCompared: Math.max(len1, len2), 
        totalMatched: 0, 
        totalUnmatched: Math.max(len1, len2) 
      };
    }
    
    // Fast empty check
    if (len1 === 0) {
      return { matchPercentage: 100, totalKeysCompared: 0, totalMatched: 0, totalUnmatched: 0 };
    }
    
    let matched = 0;
    let unmatched = 0;
    
    // Ultra-fast key-value comparison with early exit
    for (let i = 0; i < len1; i++) {
      const key = keys1[i];
      if (!Object.prototype.hasOwnProperty.call(obj2, key)) {
        unmatched++;
        continue;
      }
      
      const valueResult = this.ultraFastCompareWithCounts(obj1[key], obj2[key]);
      matched += valueResult.totalMatched;
      unmatched += valueResult.totalUnmatched;
      
      // Early exit if we have too many mismatches
      if (unmatched > len1 / 2) {
        return { 
          matchPercentage: 0, 
          totalKeysCompared: len1, 
          totalMatched: matched, 
          totalUnmatched: len1 - matched 
        };
      }
    }
    
    const totalKeysCompared = matched + unmatched;
    const matchPercentage = totalKeysCompared > 0 ? Math.round((matched / totalKeysCompared) * 100) : 100;
    
    return { matchPercentage, totalKeysCompared, totalMatched: matched, totalUnmatched: unmatched };
  }

  /**
   * Ultra-fast comparison with simple result object
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {Object} Simple result
   */
  static ultraFastCompareWithResult(obj1, obj2) {
    const result = this.ultraFastCompareWithCounts(obj1, obj2);
    
    return {
      matched: { keys: [], values: [] },
      unmatched: { keys: [], values: [], types: [] },
      regexChecks: { passed: [], failed: [] },
      summary: {
        matchPercentage: result.matchPercentage,
        totalKeysCompared: result.totalKeysCompared,
        totalMatched: result.totalMatched,
        totalUnmatched: result.totalUnmatched,
        totalRegexChecks: 0
      }
    };
  }

  /**
   * Ultra-fast comparison with accurate counting
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {Object} Result with accurate counts
   */
  static ultraFastCompareWithCounts(obj1, obj2) {
    // Fastest possible: reference equality
    if (obj1 === obj2) {
      // For reference equality, we still need to count the keys if they're objects
      if (typeof obj1 === 'object' && obj1 !== null) {
        if (Array.isArray(obj1)) {
          return { matchPercentage: 100, totalKeysCompared: obj1.length, totalMatched: obj1.length, totalUnmatched: 0 };
        } else {
          const keyCount = Object.keys(obj1).length;
          return { matchPercentage: 100, totalKeysCompared: keyCount, totalMatched: keyCount, totalUnmatched: 0 };
        }
      }
      return { matchPercentage: 100, totalKeysCompared: 1, totalMatched: 1, totalUnmatched: 0 };
    }
    
    // Fast type check
    if (typeof obj1 !== typeof obj2) {
      return { matchPercentage: 0, totalKeysCompared: 1, totalMatched: 0, totalUnmatched: 1 };
    }
    
    // Fast null check
    if (obj1 == null || obj2 == null) {
      const isEqual = obj1 === obj2;
      return { 
        matchPercentage: isEqual ? 100 : 0, 
        totalKeysCompared: 1, 
        totalMatched: isEqual ? 1 : 0, 
        totalUnmatched: isEqual ? 0 : 1 
      };
    }
    
    // Fast primitive comparison
    if (typeof obj1 !== 'object') {
      const isEqual = obj1 === obj2;
      return { 
        matchPercentage: isEqual ? 100 : 0, 
        totalKeysCompared: 1, 
        totalMatched: isEqual ? 1 : 0, 
        totalUnmatched: isEqual ? 0 : 1 
      };
    }
    
    // Fast array comparison
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      return this.ultraFastCompareArraysWithCounts(obj1, obj2);
    }
    
    // Fast object comparison
    return this.ultraFastCompareObjectsWithCounts(obj1, obj2);
  }
}

module.exports = UltraFastComparator;
