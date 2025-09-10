/**
 * @fileoverview Boolean-only comparison for maximum speed
 * @author AshmeetSehgal.com
 * @description Pure boolean comparison with zero object creation
 */

/**
 * Boolean-only comparison class - absolute maximum performance
 */
class BooleanComparator {
  /**
   * Pure boolean comparison - fastest possible
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {boolean} Comparison result
   */
  static booleanCompare(obj1, obj2) {
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
      return this.booleanCompareArrays(obj1, obj2);
    }
    
    // Fast object comparison
    return this.booleanCompareObjects(obj1, obj2);
  }

  /**
   * Boolean array comparison
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @returns {boolean} Comparison result
   */
  static booleanCompareArrays(arr1, arr2) {
    const len = arr1.length;
    
    // Fast length check
    if (len !== arr2.length) return false;
    
    // Fast empty check
    if (len === 0) return true;
    
    // Ultra-fast element comparison with early exit
    for (let i = 0; i < len; i++) {
      if (!this.booleanCompare(arr1[i], arr2[i])) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Boolean object comparison
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {boolean} Comparison result
   */
  static booleanCompareObjects(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const len = keys1.length;
    
    // Fast key count check
    if (len !== Object.keys(obj2).length) return false;
    
    // Fast empty check
    if (len === 0) return true;
    
    // Ultra-fast key-value comparison with early exit
    for (let i = 0; i < len; i++) {
      const key = keys1[i];
      if (!(key in obj2) || !this.booleanCompare(obj1[key], obj2[key])) {
        return false;
      }
    }
    
    return true;
  }
}

module.exports = BooleanComparator;
