/**
 * @fileoverview Shared comparison utilities for JSONCompare
 * @author AshmeetSehgal.com
 * @description Common comparison logic extracted to reduce code duplication and improve maintainability
 */

const CommonComparison = require('./CommonComparison');

/**
 * Shared comparison utilities used across different comparators
 * Delegates basic comparison operations to CommonComparison to eliminate duplication
 * @private
 */
class ComparisonUtils {
  /**
   * Fast reference equality check
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {boolean} Whether objects are reference equal
   */
  static referenceEqual(obj1, obj2) {
    return CommonComparison.referenceEqual(obj1, obj2);
  }

  /**
   * Fast type equality check
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {boolean} Whether objects have the same type
   */
  static typeEqual(obj1, obj2) {
    return CommonComparison.typeEqual(obj1, obj2);
  }

  /**
   * Fast null/undefined check
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {boolean|null} Comparison result, or null if not null/undefined case
   */
  static nullCheck(obj1, obj2) {
    return CommonComparison.nullCheck(obj1, obj2);
  }

  /**
   * Fast primitive comparison
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {boolean|null} Comparison result, or null if not primitive case
   */
  static primitiveCompare(obj1, obj2) {
    return CommonComparison.primitiveCompare(obj1, obj2);
  }

  /**
   * Check if both values are arrays
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {boolean} Whether both are arrays
   */
  static bothArrays(obj1, obj2) {
    return CommonComparison.bothArrays(obj1, obj2);
  }

  /**
   * Check if both values are plain objects
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {boolean} Whether both are plain objects
   */
  static bothPlainObjects(obj1, obj2) {
    return CommonComparison.bothPlainObjects(obj1, obj2);
  }

  /**
   * Fast array length comparison
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @returns {boolean} Whether arrays have the same length
   */
  static arrayLengthEqual(arr1, arr2) {
    return CommonComparison.arrayLengthEqual(arr1, arr2);
  }

  /**
   * Fast object key count comparison
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {boolean} Whether objects have the same number of keys
   */
  static objectKeysCountEqual(obj1, obj2) {
    return CommonComparison.objectKeysCountEqual(obj1, obj2);
  }

  /**
   * Calculate early exit threshold based on collection size
   * @param {number} size - Size of collection
   * @param {number} [ratio=0.3] - Ratio for early exit (default 30%)
   * @returns {number} Threshold for early exit
   */
  static getEarlyExitThreshold(size, ratio = 0.3) {
    return Math.max(1, Math.floor(size * ratio));
  }

  /**
   * Calculate match percentage
   * @param {number} matched - Number of matched items
   * @param {number} total - Total number of items
   * @returns {number} Match percentage (0-100)
   */
  static calculateMatchPercentage(matched, total) {
    return total > 0 ? Math.round((matched / total) * 100) : 100;
  }

  /**
   * Create a standard comparison result object
   * @param {number} matchPercentage - Match percentage
   * @param {number} totalKeys - Total keys compared
   * @param {number} matched - Number of matched items
   * @param {number} unmatched - Number of unmatched items
   * @returns {Object} Standard result object
   */
  static createResult(matchPercentage, totalKeys, matched, unmatched) {
    return {
      matchPercentage,
      totalKeys,
      matched,
      unmatched
    };
  }

  /**
   * Create a failure result for early exit scenarios
   * @param {number} totalKeys - Total keys that would be compared
   * @param {number} [matched=0] - Number of items already matched
   * @param {number} [unmatched] - Number of items unmatched (defaults to totalKeys - matched)
   * @returns {Object} Failure result object
   */
  static createFailureResult(totalKeys, matched = 0, unmatched = null) {
    const actualUnmatched = unmatched ?? totalKeys - matched;
    return this.createResult(0, totalKeys, matched, actualUnmatched);
  }

  /**
   * Create a success result for complete matches
   * @param {number} totalKeys - Total keys compared
   * @returns {Object} Success result object
   */
  static createSuccessResult(totalKeys) {
    return this.createResult(100, totalKeys, totalKeys, 0);
  }

  /**
   * Optimized null/undefined value comparison
   * @param {*} val1 - First value
   * @param {*} val2 - Second value
   * @returns {boolean|null} Comparison result, or null if not null/undefined case
   */
  static compareNullishValues(val1, val2) {
    const val1IsNullish = val1 == null;
    const val2IsNullish = val2 == null;
    
    if (val1IsNullish || val2IsNullish) {
      return val1 === val2;
    }
    
    return null; // Not a null case
  }

  /**
   * Check if a value should trigger early exit based on mismatch ratio
   * @param {number} unmatched - Current unmatched count
   * @param {number} threshold - Early exit threshold
   * @returns {boolean} Whether to exit early
   */
  static shouldExitEarly(unmatched, threshold) {
    return unmatched > threshold;
  }

  /**
   * Batch comparison for multiple values (useful for array elements)
   * @param {Array} values1 - First set of values
   * @param {Array} values2 - Second set of values
   * @param {number} startIndex - Starting index
   * @param {number} batchSize - Number of items to compare in batch
   * @returns {Object} Batch comparison result
   */
  static batchCompare(values1, values2, startIndex, batchSize) {
    let matched = 0;
    let unmatched = 0;
    const endIndex = Math.min(startIndex + batchSize, values1.length);

    for (let i = startIndex; i < endIndex; i++) {
      if (values1[i] === values2[i]) {
        matched++;
      } else {
        unmatched++;
      }
    }

    return { matched, unmatched, processed: endIndex - startIndex };
  }
}

module.exports = ComparisonUtils;

