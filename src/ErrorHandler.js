/**
 * @fileoverview Error handling and reliability utilities
 * @author AshmeetSehgal.com
 * @description Centralized error handling, validation, and reliability improvements
 */

const CommonUtils = require('./CommonUtils');

/**
 * Error handling and reliability utilities
 * @private
 */
class ErrorHandler {
  /**
   * Safely execute a function with error handling
   * @param {Function} fn - Function to execute
   * @param {string} context - Context for error reporting
   * @param {*} fallback - Fallback value if function fails
   * @returns {*} Result of function or fallback value
   */
  static safeExecute(fn, context = 'Unknown', fallback = null) {
    return CommonUtils.safeExecute(fn, context, fallback);
  }

  /**
   * Validate input parameters for comparison functions
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @param {string} functionName - Name of the calling function
   * @returns {Object} Validation result
   */
  static validateInputs(obj1, obj2) {
    const result = { isValid: true, errors: [] };

    // Check for null/undefined inputs
    if (obj1 === null && obj2 === null) {
      return { isValid: true, isNullComparison: true };
    }

    if (obj1 === undefined && obj2 === undefined) {
      return { isValid: true, isUndefinedComparison: true };
    }

    // Check for invalid combinations
    if ((obj1 === null && obj2 === undefined) || (obj1 === undefined && obj2 === null)) {
      result.isValid = true;
      result.isNullUndefinedComparison = true;
      return result;
    }

    // Check for circular references
    if (this.hasCircularReference(obj1) || this.hasCircularReference(obj2)) {
      result.warnings = result.warnings || [];
      result.warnings.push('Circular reference detected in input objects');
    }

    return result;
  }

  /**
   * Check if an object has circular references
   * @param {*} obj - Object to check
   * @param {Set} [seen] - Set of already seen objects
   * @returns {boolean} Whether object has circular references
   */
  static hasCircularReference(obj, seen = new Set()) {
    if (obj === null || typeof obj !== 'object') {
      return false;
    }

    if (seen.has(obj)) {
      return true;
    }

    seen.add(obj);

    try {
      if (Array.isArray(obj)) {
        for (const item of obj) {
          if (this.hasCircularReference(item, seen)) {
            return true;
          }
        }
      } else {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (this.hasCircularReference(obj[key], seen)) {
              return true;
            }
          }
        }
      }
    } catch (error) {
      // If we can't traverse the object, assume it might have circular refs
      return true;
    } finally {
      seen.delete(obj);
    }

    return false;
  }

  /**
   * Safely get object keys with error handling
   * @param {Object} obj - Object to get keys from
   * @returns {string[]} Array of keys or empty array if error
   */
  static safeGetKeys(obj) {
    return CommonUtils.safeKeys(obj);
  }

  /**
   * Safely get object values with error handling
   * @param {Object} obj - Object to get values from
   * @returns {Array} Array of values or empty array if error
   */
  static safeGetValues(obj) {
    return CommonUtils.safeValues(obj);
  }

  /**
   * Safely check if object has property
   * @param {Object} obj - Object to check
   * @param {string} key - Property key
   * @returns {boolean} Whether object has property
   */
  static safeHasProperty(obj, key) {
    return CommonUtils.safeHasProperty(obj, key);
  }

  /**
   * Safely get object property value
   * @param {Object} obj - Object to get property from
   * @param {string} key - Property key
   * @param {*} defaultValue - Default value if property doesn't exist
   * @returns {*} Property value or default value
   */
  static safeGetProperty(obj, key, defaultValue = undefined) {
    return CommonUtils.safeGet(obj, key, defaultValue);
  }

  /**
   * Safely get array length
   * @param {Array} arr - Array to get length from
   * @returns {number} Array length or 0 if error
   */
  static safeGetLength(arr) {
    return CommonUtils.safeLength(arr);
  }

  /**
   * Safely compare two values with type checking
   * @param {*} val1 - First value
   * @param {*} val2 - Second value
   * @param {boolean} strict - Whether to use strict equality
   * @returns {boolean} Comparison result
   */
  static safeCompare(val1, val2, strict = true) {
    try {
      if (strict) {
        return val1 === val2;
      } else {
        return val1 == val2;
      }
    } catch (error) {
      // Silently handle error and return false
      return false;
    }
  }

  /**
   * Safely get type of value
   * @param {*} value - Value to get type of
   * @returns {string} Type of value
   */
  static safeGetType(value) {
    try {
      if (value === null) return 'null';
      if (value === undefined) return 'undefined';
      return typeof value;
    } catch (error) {
      // Silently handle error and return unknown
      return 'unknown';
    }
  }

  /**
   * Create a safe comparison function with error handling
   * @param {Function} compareFn - Comparison function to wrap
   * @param {string} context - Context for error reporting
   * @param {*} fallback - Fallback value if comparison fails
   * @returns {Function} Safe comparison function
   */
  static createSafeComparison(compareFn, context = 'comparison', fallback = false) {
    return (obj1, obj2) => {
      return ErrorHandler.safeExecute(() => compareFn(obj1, obj2), context, fallback);
    };
  }

  /**
   * Validate options object
   * @param {Object} options - Options to validate
   * @returns {Object} Validation result with sanitized options
   */
  static validateOptions(options) {
    const result = { isValid: true, sanitized: {}, errors: [] };

    if (!options || typeof options !== 'object') {
      result.errors.push('Options must be an object');
      result.isValid = false;
      return result;
    }

    // Validate ignoredKeys
    if (options.ignoredKeys !== undefined) {
      if (Array.isArray(options.ignoredKeys)) {
        result.sanitized.ignoredKeys = options.ignoredKeys.filter(key => typeof key === 'string');
      } else {
        result.errors.push('ignoredKeys must be an array of strings');
        result.sanitized.ignoredKeys = [];
        result.isValid = false;
      }
    }

    // Validate equivalentValues
    if (options.equivalentValues !== undefined) {
      if (typeof options.equivalentValues === 'object' && options.equivalentValues !== null) {
        result.sanitized.equivalentValues = options.equivalentValues;
      } else {
        result.errors.push('equivalentValues must be an object');
        result.sanitized.equivalentValues = {};
        result.isValid = false;
      }
    }

    // Validate regexChecks
    if (options.regexChecks !== undefined) {
      if (typeof options.regexChecks === 'object' && options.regexChecks !== null) {
        result.sanitized.regexChecks = options.regexChecks;
      } else {
        result.errors.push('regexChecks must be an object');
        result.sanitized.regexChecks = {};
        result.isValid = false;
      }
    }

    // Validate boolean options
    const booleanOptions = ['strictTypes', 'ignoreExtraKeys', 'matchKeysByName'];
    booleanOptions.forEach(option => {
      if (options[option] !== undefined) {
        if (typeof options[option] === 'boolean') {
          result.sanitized[option] = options[option];
        } else {
          result.errors.push(`${option} must be a boolean`);
          result.sanitized[option] = option === 'strictTypes' ? true : false;
          result.isValid = false;
        }
      }
    });

    return result;
  }
}

module.exports = ErrorHandler;
