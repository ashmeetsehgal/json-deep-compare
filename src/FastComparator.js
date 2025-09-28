/**
 * @fileoverview Fast comparison implementation for JSONCompare
 * @author AshmeetSehgal.com
 * @description Optimized comparison algorithms for maximum performance
 */

/**
 * Fast comparison class for basic object equality
 */
class FastComparator {
  /**
   * Fast comparison with minimal overhead
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {Object} Simple result with match percentage
   */
  static fastCompare(obj1, obj2) {
    // Early exit for reference equality (fastest possible)
    if (obj1 === obj2) {
      return { matchPercentage: 100, totalKeys: 0, matched: 0, unmatched: 0 };
    }

    // Early exit for type mismatch
    if (typeof obj1 !== typeof obj2) {
      return { matchPercentage: 0, totalKeys: 1, matched: 0, unmatched: 1 };
    }

    // Early exit for null/undefined
    if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined) {
      return { 
        matchPercentage: obj1 === obj2 ? 100 : 0, 
        totalKeys: 1, 
        matched: obj1 === obj2 ? 1 : 0, 
        unmatched: obj1 === obj2 ? 0 : 1 
      };
    }

    // Fast primitive comparison
    if (typeof obj1 !== 'object') {
      return { 
        matchPercentage: obj1 === obj2 ? 100 : 0, 
        totalKeys: 1, 
        matched: obj1 === obj2 ? 1 : 0, 
        unmatched: obj1 === obj2 ? 0 : 1 
      };
    }

    // Fast array comparison
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      return this.fastCompareArrays(obj1, obj2);
    }

    // Fast object comparison
    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
      return this.fastCompareObjects(obj1, obj2);
    }

    // Fallback
    return { matchPercentage: 0, totalKeys: 1, matched: 0, unmatched: 1 };
  }

  /**
   * Fast array comparison
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @returns {Object} Comparison result
   */
  static fastCompareArrays(arr1, arr2) {
    const len1 = arr1.length;
    const len2 = arr2.length;

    // Early exit for different lengths
    if (len1 !== len2) {
      return { 
        matchPercentage: 0, 
        totalKeys: Math.max(len1, len2), 
        matched: 0, 
        unmatched: Math.max(len1, len2) 
      };
    }

    // Early exit for empty arrays
    if (len1 === 0) {
      return { matchPercentage: 100, totalKeys: 0, matched: 0, unmatched: 0 };
    }

    let matched = 0;
    let unmatched = 0;

    // Compare elements with early exit on first mismatch
    for (let i = 0; i < len1; i++) {
      if (arr1[i] === arr2[i]) {
        matched++;
      } else {
        // Check for strict null/undefined equality before deep comparison
        const elem1 = arr1[i];
        const elem2 = arr2[i];
        const elem1IsNullish = elem1 === null || elem1 === undefined;
        const elem2IsNullish = elem2 === null || elem2 === undefined;
        
        if (elem1IsNullish && elem2IsNullish) {
          // Both are null/undefined - check strict equality
          if (elem1 === elem2) {
            matched++;
          } else {
            unmatched++;
            // Early exit if we have too many mismatches
            if (unmatched > len1 / 2) {
              return { 
                matchPercentage: 0, 
                totalKeys: len1, 
                matched, 
                unmatched: len1 - matched 
              };
            }
          }
        } else {
          // For nested objects, do a quick deep check
          const nestedResult = this.fastCompare(elem1, elem2);
          if (nestedResult.matchPercentage === 100) {
            matched++;
          } else {
            unmatched++;
            // Early exit if we have too many mismatches
            if (unmatched > len1 / 2) {
              return { 
                matchPercentage: 0, 
                totalKeys: len1, 
                matched, 
                unmatched: len1 - matched 
              };
            }
          }
        }
      }
    }

    const totalKeys = matched + unmatched;
    const matchPercentage = totalKeys > 0 ? (matched / totalKeys) * 100 : 100;

    return { matchPercentage, totalKeys, matched, unmatched };
  }

  /**
   * Fast object comparison
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {Object} Comparison result
   */
  static fastCompareObjects(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const len1 = keys1.length;
    const len2 = keys2.length;

    // Early exit for different key counts
    if (len1 !== len2) {
      return { 
        matchPercentage: 0, 
        totalKeys: Math.max(len1, len2), 
        matched: 0, 
        unmatched: Math.max(len1, len2) 
      };
    }

    // Early exit for empty objects
    if (len1 === 0) {
      return { matchPercentage: 100, totalKeys: 0, matched: 0, unmatched: 0 };
    }

    let matched = 0;
    let unmatched = 0;

    // Compare keys and values
    for (let i = 0; i < len1; i++) {
      const key = keys1[i];
      
      // Check if key exists in obj2
      if (!(key in obj2)) {
        unmatched++;
        continue;
      }

      // Compare values
      if (obj1[key] === obj2[key]) {
        matched++;
      } else {
        // Check for strict null/undefined equality before deep comparison
        const val1 = obj1[key];
        const val2 = obj2[key];
        const val1IsNullish = val1 === null || val1 === undefined;
        const val2IsNullish = val2 === null || val2 === undefined;
        
        if (val1IsNullish && val2IsNullish) {
          // Both are null/undefined - check strict equality
          if (val1 === val2) {
            matched++;
          } else {
            unmatched++;
            // Early exit if we have too many mismatches
            if (unmatched > len1 / 2) {
              return { 
                matchPercentage: 0, 
                totalKeys: len1, 
                matched, 
                unmatched: len1 - matched 
              };
            }
          }
        } else {
          // For nested objects, do a quick deep check
          const nestedResult = this.fastCompare(val1, val2);
          if (nestedResult.matchPercentage === 100) {
            matched++;
          } else {
            unmatched++;
            // Early exit if we have too many mismatches
            if (unmatched > len1 / 2) {
              return { 
                matchPercentage: 0, 
                totalKeys: len1, 
                matched, 
                unmatched: len1 - matched 
              };
            }
          }
        }
      }
    }

    const totalKeys = matched + unmatched;
    const matchPercentage = totalKeys > 0 ? (matched / totalKeys) * 100 : 100;

    return { matchPercentage, totalKeys, matched, unmatched };
  }

  /**
   * Check if fast comparison mode should be used
   * @param {Object} options - Comparison options
   * @returns {boolean} Whether to use fast mode
   */
  static shouldUseFastMode(options) {
    // Only use fast mode for absolute basic comparisons
    return (!options.regexChecks || Object.keys(options.regexChecks).length === 0) &&
           (!options.equivalentValues || Object.keys(options.equivalentValues).length === 0) &&
           options.strictTypes === true &&  // Must be explicitly true
           (!options.ignoredKeys || options.ignoredKeys.length === 0) &&
           options.ignoreExtraKeys === true &&  // Must be explicitly true to enable fast mode when ignoring extras
           !options.matchKeysByName;
  }
}

module.exports = FastComparator;
