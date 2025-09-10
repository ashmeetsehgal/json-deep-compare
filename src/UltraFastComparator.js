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
    const keys1 = Object.keys(obj1);
    const len = keys1.length;
    
    // Fast key count check
    if (len !== Object.keys(obj2).length) return false;
    
    // Fast empty check
    if (len === 0) return true;
    
    // Ultra-fast key-value comparison with early exit
    for (let i = 0; i < len; i++) {
      const key = keys1[i];
      if (!(key in obj2) || !this.ultraFastCompare(obj1[key], obj2[key])) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Ultra-fast comparison with simple result object
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {Object} Simple result
   */
  static ultraFastCompareWithResult(obj1, obj2) {
    const isEqual = this.ultraFastCompare(obj1, obj2);
    
    return {
      matched: { keys: [], values: [] },
      unmatched: { keys: [], values: [], types: [] },
      regexChecks: { passed: [], failed: [] },
      summary: {
        matchPercentage: isEqual ? 100 : 0,
        totalKeysCompared: 1,
        totalMatched: isEqual ? 1 : 0,
        totalUnmatched: isEqual ? 0 : 1,
        totalRegexChecks: 0
      }
    };
  }
}

module.exports = UltraFastComparator;
