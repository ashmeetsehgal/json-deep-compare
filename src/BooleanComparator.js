/**
 * @fileoverview Boolean-only comparison for maximum speed
 * @author AshmeetSehgal.com
 * @description Pure boolean comparison with zero object creation
 */

const CommonComparison = require('./CommonComparison');

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
    // Use common early checks to reduce duplication (with strict NaN comparison)
    const earlyResult = CommonComparison.performEarlyChecks(obj1, obj2, true);
    if (earlyResult.shouldExit) {
      return earlyResult.result;
    }
    
    // Explicit XOR array check - prevent arrays from being treated as plain objects
    if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
    
    // Fast array comparison
    if (CommonComparison.bothArrays(obj1, obj2)) {
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
    return CommonComparison.compareArrays(arr1, arr2, this.booleanCompare.bind(this));
  }

  /**
   * Boolean object comparison
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {boolean} Comparison result
   */
  static booleanCompareObjects(obj1, obj2) {
    return CommonComparison.compareObjects(obj1, obj2, this.booleanCompare.bind(this));
  }
}

module.exports = BooleanComparator;
