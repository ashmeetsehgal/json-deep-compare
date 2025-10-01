/**
 * @fileoverview Common comparison utilities to reduce code duplication
 * @author AshmeetSehgal.com
 * @description Shared comparison logic extracted from various comparators
 */

/**
 * Common comparison utilities to reduce duplication across comparators
 * @private
 */
class CommonComparison {
  /**
   * Fast reference equality check - used by all comparators
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {boolean} Whether objects are reference equal
   */
  static referenceEqual(obj1, obj2) {
    return obj1 === obj2;
  }

  /**
   * Fast type equality check - used by all comparators
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {boolean} Whether objects have the same type
   */
  static typeEqual(obj1, obj2) {
    return typeof obj1 === typeof obj2;
  }

  /**
   * Fast null/undefined check - used by all comparators
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {boolean|null} Comparison result, or null if not null/undefined case
   */
  static nullCheck(obj1, obj2) {
    if (obj1 == null || obj2 == null) {
      return obj1 === obj2;
    }
    return null; // Not a null case, continue with other checks
  }

  /**
   * Fast primitive comparison - used by all comparators
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {boolean|null} Comparison result, or null if not primitive case
   */
  static primitiveCompare(obj1, obj2) {
    if (typeof obj1 !== 'object') {
      return obj1 === obj2;
    }
    return null; // Not a primitive case
  }

  /**
   * Check if both values are arrays - used by all comparators
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {boolean} Whether both are arrays
   */
  static bothArrays(obj1, obj2) {
    return Array.isArray(obj1) && Array.isArray(obj2);
  }

  /**
   * Check if both values are plain objects - used by all comparators
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {boolean} Whether both are plain objects
   */
  static bothPlainObjects(obj1, obj2) {
    return typeof obj1 === 'object' && typeof obj2 === 'object' &&
           obj1 !== null && obj2 !== null &&
           Object.getPrototypeOf(obj1) === Object.prototype && 
           Object.getPrototypeOf(obj2) === Object.prototype;
  }

  /**
   * Fast array length comparison - used by all comparators
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @returns {boolean} Whether arrays have the same length
   */
  static arrayLengthEqual(arr1, arr2) {
    return arr1.length === arr2.length;
  }

  /**
   * Fast object key count comparison - used by all comparators
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {boolean} Whether objects have the same number of keys
   */
  static objectKeysCountEqual(obj1, obj2) {
    return Object.keys(obj1).length === Object.keys(obj2).length;
  }

  /**
   * Common array comparison logic - reduces duplication across comparators
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @param {Function} compareFunction - Function to compare individual elements
   * @returns {boolean} Comparison result
   */
  static compareArrays(arr1, arr2, compareFunction) {
    const len = arr1.length;
    
    // Fast length check
    if (len !== arr2.length) return false;
    
    // Fast empty check
    if (len === 0) return true;
    
    // Compare elements using provided function
    for (let i = 0; i < len; i++) {
      if (!compareFunction(arr1[i], arr2[i])) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Common object comparison logic - reduces duplication across comparators
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @param {Function} compareFunction - Function to compare individual values
   * @returns {boolean} Comparison result
   */
  static compareObjects(obj1, obj2, compareFunction) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const len = keys1.length;
    
    // Fast key count check
    if (len !== keys2.length) return false;
    
    // Fast empty check
    if (len === 0) return true;
    
    // Compare key-value pairs using provided function
    for (let i = 0; i < len; i++) {
      const key = keys1[i];
      if (!Object.prototype.hasOwnProperty.call(obj2, key) || 
          !compareFunction(obj1[key], obj2[key])) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Common early exit checks - reduces duplication in comparison methods
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {Object} Result with early exit info
   */
  static performEarlyChecks(obj1, obj2) {
    // Fastest possible: reference equality
    if (this.referenceEqual(obj1, obj2)) {
      return { shouldExit: true, result: true };
    }
    
    // Fast type check
    if (!this.typeEqual(obj1, obj2)) {
      return { shouldExit: true, result: false };
    }
    
    // Fast null check
    const nullResult = this.nullCheck(obj1, obj2);
    if (nullResult !== null) {
      return { shouldExit: true, result: nullResult };
    }
    
    // Fast primitive comparison
    const primitiveResult = this.primitiveCompare(obj1, obj2);
    if (primitiveResult !== null) {
      return { shouldExit: true, result: primitiveResult };
    }
    
    return { shouldExit: false, result: null };
  }
}

module.exports = CommonComparison;
