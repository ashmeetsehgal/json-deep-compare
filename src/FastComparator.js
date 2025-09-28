/**
 * @fileoverview Fast comparison implementation for JSONCompare
 * @author AshmeetSehgal.com
 * @description Optimized comparison algorithms for maximum performance
 */

const ComparisonUtils = require('./ComparisonUtils');

/**
 * Fast comparison class for basic object equality
 */
class FastComparator {
  /**
   * Fast comparison with minimal overhead using shared utilities
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {Object} Simple result with match percentage
   */
  static fastCompare(obj1, obj2) {
    // Early exit for reference equality (fastest possible)
    if (ComparisonUtils.referenceEqual(obj1, obj2)) {
      return ComparisonUtils.createSuccessResult(0);
    }

    // Early exit for type mismatch
    if (!ComparisonUtils.typeEqual(obj1, obj2)) {
      return ComparisonUtils.createFailureResult(1);
    }

    // Early exit for null/undefined
    const nullResult = ComparisonUtils.nullCheck(obj1, obj2);
    if (nullResult !== null) {
      return nullResult ? ComparisonUtils.createSuccessResult(1) : ComparisonUtils.createFailureResult(1);
    }

    // Fast primitive comparison
    const primitiveResult = ComparisonUtils.primitiveCompare(obj1, obj2);
    if (primitiveResult !== null) {
      return primitiveResult ? ComparisonUtils.createSuccessResult(1) : ComparisonUtils.createFailureResult(1);
    }

    // Fast array comparison
    if (ComparisonUtils.bothArrays(obj1, obj2)) {
      return this.fastCompareArrays(obj1, obj2);
    }

    // Fast object comparison
    if (ComparisonUtils.bothPlainObjects(obj1, obj2)) {
      return this.fastCompareObjects(obj1, obj2);
    }

    // Fallback for non-plain objects
    return ComparisonUtils.createFailureResult(1);
  }

  /**
   * Fast array comparison with optimized single-pass processing
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @returns {Object} Comparison result
   */
  static fastCompareArrays(arr1, arr2) {
    const len1 = arr1.length;
    const len2 = arr2.length;

    // Early exit for different lengths
    if (!ComparisonUtils.arrayLengthEqual(arr1, arr2)) {
      return ComparisonUtils.createFailureResult(Math.max(len1, len2));
    }

    // Early exit for empty arrays
    if (len1 === 0) {
      return ComparisonUtils.createSuccessResult(0);
    }

    let matched = 0;
    let unmatched = 0;
    const earlyExitThreshold = ComparisonUtils.getEarlyExitThreshold(len1);

    // Single-pass comparison with early termination
    for (let i = 0; i < len1; i++) {
      const elem1 = arr1[i];
      const elem2 = arr2[i];
      
      if (elem1 === elem2) {
        matched++;
      } else if (this._fastValueCompare(elem1, elem2)) {
        matched++;
      } else {
        unmatched++;
        // Early exit if mismatch ratio is too high
        if (ComparisonUtils.shouldExitEarly(unmatched, earlyExitThreshold)) {
          return ComparisonUtils.createFailureResult(len1, matched);
        }
      }
    }

    const totalKeys = matched + unmatched;
    const matchPercentage = ComparisonUtils.calculateMatchPercentage(matched, totalKeys);

    return ComparisonUtils.createResult(matchPercentage, totalKeys, matched, unmatched);
  }

  /**
   * Fast object comparison with optimized single-pass processing
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {Object} Comparison result
   */
  static fastCompareObjects(obj1, obj2) {
    // Guard: Only use fast path for plain objects (prototype === Object.prototype)
    if (Object.getPrototypeOf(obj1) !== Object.prototype || 
        Object.getPrototypeOf(obj2) !== Object.prototype) {
      // Fall back to stricter comparison for non-plain objects
      return { matchPercentage: 0, totalKeys: 1, matched: 0, unmatched: 1 };
    }

    const keys1 = Object.keys(obj1);
    const len1 = keys1.length;

    // Early exit for empty objects
    if (len1 === 0) {
      const keys2Len = Object.keys(obj2).length;
      return { 
        matchPercentage: keys2Len === 0 ? 100 : 0, 
        totalKeys: Math.max(len1, keys2Len), 
        matched: keys2Len === 0 ? 0 : 0, 
        unmatched: keys2Len === 0 ? 0 : keys2Len 
      };
    }

    // Use Set for O(1) key lookup instead of O(n) array search
    const keys2Set = new Set(Object.keys(obj2));
    const len2 = keys2Set.size;

    // Early exit when obj2 is missing keys from obj1 (ignoreExtraKeys support)
    if (len2 < len1) {
      return { 
        matchPercentage: 0, 
        totalKeys: len1, 
        matched: 0, 
        unmatched: len1 
      };
    }

    let matched = 0;
    let unmatched = 0;
    const earlyExitThreshold = Math.max(1, Math.floor(len1 * 0.3)); // Exit if >70% mismatch

    // Single-pass comparison with early termination
    for (let i = 0; i < len1; i++) {
      const key = keys1[i];
      
      // O(1) key existence check
      if (!keys2Set.has(key)) {
        unmatched++;
        // Early exit if too many keys are missing
        if (unmatched > earlyExitThreshold) {
          return { 
            matchPercentage: 0, 
            totalKeys: len1, 
            matched, 
            unmatched: len1 - matched 
          };
        }
        continue;
      }

      // Fast value comparison
      const val1 = obj1[key];
      const val2 = obj2[key];
      
      if (val1 === val2) {
        matched++;
      } else if (this._fastValueCompare(val1, val2)) {
        matched++;
      } else {
        unmatched++;
        // Early exit if mismatch ratio is too high
        if (unmatched > earlyExitThreshold) {
          return { 
            matchPercentage: 0, 
            totalKeys: len1, 
            matched, 
            unmatched: len1 - matched 
          };
        }
      }
    }

    const totalKeys = matched + unmatched;
    const matchPercentage = totalKeys > 0 ? (matched / totalKeys) * 100 : 100;

    return { matchPercentage, totalKeys, matched, unmatched };
  }

  /**
   * Fast value comparison helper with optimized null/nested checks
   * @param {*} val1 - First value
   * @param {*} val2 - Second value
   * @returns {boolean} Whether values match
   * @private
   */
  static _fastValueCompare(val1, val2) {
    // Handle null/undefined quickly
    const val1IsNullish = val1 == null;
    const val2IsNullish = val2 == null;
    
    if (val1IsNullish || val2IsNullish) {
      return val1 === val2;
    }

    // For nested objects, do a quick deep check only if both are objects
    if (typeof val1 === 'object' && typeof val2 === 'object') {
      const nestedResult = this.fastCompare(val1, val2);
      return nestedResult.matchPercentage === 100;
    }

    // Type mismatch for non-objects
    return false;
  }

  /**
   * Check if fast comparison mode should be used
   * @param {Object} options - Comparison options
   * @returns {boolean} Whether to use fast mode
   */
  static shouldUseFastMode(options) {
    // Only use fast mode for absolute basic comparisons with specific settings
    // Note: ignoreExtraKeys should be true for fast mode to work properly
    return (!options.regexChecks || Object.keys(options.regexChecks).length === 0) &&
           (!options.equivalentValues || Object.keys(options.equivalentValues).length === 0) &&
           options.strictTypes === true &&  // Must be explicitly true
           (!options.ignoredKeys || options.ignoredKeys.length === 0) &&
           options.ignoreExtraKeys === true &&  // Must be explicitly true for fast mode
           !options.matchKeysByName;
  }
}

module.exports = FastComparator;
