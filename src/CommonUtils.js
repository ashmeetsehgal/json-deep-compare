/**
 * @fileoverview Common utilities to reduce code duplication
 * @author AshmeetSehgal.com
 * @description Shared utility functions used across multiple modules
 */

/**
 * Common utility functions to reduce code duplication
 */
class CommonUtils {
  /**
   * Safe warning handler - silently handles errors without console output
   * @param {string} context - Context where the warning occurred
   * @param {string} message - Warning message
   * @param {Error} [error] - Optional error object
   */
  static safeWarn(context, message, error = null) {
    // Intentionally silent - errors are handled gracefully without console output
    // This is a design choice to avoid production console pollution
    // Parameters are accepted for API compatibility but not used
    void context; void message; void error;
  }

  /**
   * Safe array check with null/undefined protection
   * @param {*} value - Value to check
   * @returns {boolean} True if value is an array
   */
  static isArray(value) {
    return Array.isArray(value);
  }

  /**
   * Safe object type check with null protection
   * @param {*} value - Value to check
   * @returns {boolean} True if value is an object (not null)
   */
  static isObject(value) {
    return typeof value === 'object' && value !== null;
  }

  /**
   * Safe null/undefined check
   * @param {*} value - Value to check
   * @returns {boolean} True if value is null or undefined
   */
  static isNullOrUndefined(value) {
    return value === null || value === undefined;
  }

  /**
   * Safe primitive type check
   * @param {*} value - Value to check
   * @returns {boolean} True if value is a primitive
   */
  static isPrimitive(value) {
    return value === null || 
           value === undefined || 
           typeof value !== 'object';
  }

  /**
   * Check if an object is a plain object (not Date, RegExp, Map, Set, etc.)
   * @param {*} obj - Object to check
   * @returns {boolean} Whether the object is a plain object
   */
  static isPlainObject(obj) {
    if (obj === null || typeof obj !== 'object') return false;
    
    // Check if it's a plain object by verifying constructor and prototype
    return Object.prototype.toString.call(obj) === '[object Object]' && 
           (obj.constructor === Object || obj.constructor === undefined);
  }

  /**
   * Safe string check
   * @param {*} value - Value to check
   * @returns {boolean} True if value is a string
   */
  static isString(value) {
    return typeof value === 'string';
  }

  /**
   * Safe number check
   * @param {*} value - Value to check
   * @returns {boolean} True if value is a number
   */
  static isNumber(value) {
    return typeof value === 'number';
  }

  /**
   * Safe boolean check
   * @param {*} value - Value to check
   * @returns {boolean} True if value is a boolean
   */
  static isBoolean(value) {
    return typeof value === 'boolean';
  }

  /**
   * Safe function check
   * @param {*} value - Value to check
   * @returns {boolean} True if value is a function
   */
  static isFunction(value) {
    return typeof value === 'function';
  }

  /**
   * Safe execution with error handling
   * @param {Function} fn - Function to execute
   * @param {string} context - Context for error reporting
   * @param {*} fallback - Fallback value if execution fails
   * @returns {*} Function result or fallback
   */
  static safeExecute(fn, context = 'Unknown', fallback = null) {
    try {
      return fn();
    } catch (error) {
      this.safeWarn(context, error.message, error);
      return fallback;
    }
  }

  /**
   * Safe property access with fallback
   * @param {Object} obj - Object to access
   * @param {string} key - Property key
   * @param {*} defaultValue - Default value if property doesn't exist
   * @returns {*} Property value or default
   */
  static safeGet(obj, key, defaultValue = undefined) {
    if (!this.isObject(obj)) {
      return defaultValue;
    }
    return this.safeExecute(() => {
      if (key in obj) {
        return obj[key];
      }
      return defaultValue;
    }, `getting property '${key}'`, defaultValue);
  }

  /**
   * Safe array length check
   * @param {Array} arr - Array to check
   * @returns {number} Array length or 0
   */
  static safeLength(arr) {
    if (!this.isArray(arr)) {
      return 0;
    }
    return this.safeExecute(() => arr.length, 'getting array length', 0);
  }

  /**
   * Safe object keys extraction
   * @param {Object} obj - Object to get keys from
   * @returns {Array} Array of keys or empty array
   */
  static safeKeys(obj) {
    if (!this.isObject(obj)) {
      return [];
    }
    return this.safeExecute(() => Object.keys(obj), 'getting object keys', []);
  }

  /**
   * Safe object values extraction
   * @param {Object} obj - Object to get values from
   * @returns {Array} Array of values or empty array
   */
  static safeValues(obj) {
    if (!this.isObject(obj)) {
      return [];
    }
    return this.safeExecute(() => Object.values(obj), 'getting object values', []);
  }

  /**
   * Safe property existence check
   * @param {Object} obj - Object to check
   * @param {string} key - Property key
   * @returns {boolean} True if property exists
   */
  static safeHasProperty(obj, key) {
    if (!this.isObject(obj)) {
      return false;
    }
    return this.safeExecute(() => key in obj, `checking property '${key}'`, false);
  }

  /**
   * Safe deep equality check for primitives
   * @param {*} a - First value
   * @param {*} b - Second value
   * @returns {boolean} True if values are equal
   */
  static safeEqual(a, b) {
    if (a === b) return true;
    if (this.isNullOrUndefined(a) && this.isNullOrUndefined(b)) return true;
    if (this.isNumber(a) && this.isNumber(b)) {
      if (isNaN(a) && isNaN(b)) return true;
      return a === b;
    }
    return false;
  }

  /**
   * Safe type comparison
   * @param {*} a - First value
   * @param {*} b - Second value
   * @returns {boolean} True if types are equal
   */
  static safeTypeEqual(a, b) {
    if (a === null && b === null) return true;
    if (a === undefined && b === undefined) return true;
    if (a === null && b === undefined) return false;
    if (a === undefined && b === null) return false;
    if (this.isNullOrUndefined(a) || this.isNullOrUndefined(b)) return false;
    return typeof a === typeof b;
  }

  /**
   * Safe array comparison
   * @param {Array} a - First array
   * @param {Array} b - Second array
   * @returns {boolean} True if arrays are equal
   */
  static safeArrayEqual(a, b) {
    if (!this.isArray(a) || !this.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!this.safeEqual(a[i], b[i])) return false;
    }
    return true;
  }

  /**
   * Safe object comparison for plain objects
   * @param {Object} a - First object
   * @param {Object} b - Second object
   * @returns {boolean} True if objects are equal
   */
  static safeObjectEqual(a, b) {
    if (!this.isObject(a) || !this.isObject(b)) return false;
    if (this.isArray(a) || this.isArray(b)) return false;
    const keysA = this.safeKeys(a);
    const keysB = this.safeKeys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!this.safeHasProperty(b, key)) return false;
      if (!this.safeEqual(a[key], b[key])) return false;
    }
    return true;
  }

  /**
   * Safe circular reference detection
   * @param {Object} obj - Object to check
   * @param {Set} [seen] - Set of seen objects
   * @returns {boolean} True if circular reference detected
   */
  static safeHasCircularReference(obj, seen = new Set()) {
    if (!this.isObject(obj)) return false;
    if (seen.has(obj)) return true;
    seen.add(obj);
    try {
      for (const key of this.safeKeys(obj)) {
        if (this.safeHasCircularReference(obj[key], seen)) {
          return true;
        }
      }
    } catch (error) {
      this.safeWarn('circular reference detection', error.message, error);
      return false;
    }
    seen.delete(obj);
    return false;
  }

  /**
   * Safe options validation
   * @param {Object} options - Options to validate
   * @param {Object} schema - Validation schema
   * @returns {boolean} True if options are valid
   */
  static safeValidateOptions(options, schema) {
    if (!this.isObject(options)) return false;
    try {
      for (const [key, validator] of Object.entries(schema)) {
        if (validator.required && !this.safeHasProperty(options, key)) {
          this.safeWarn('options validation', `Required option '${key}' is missing`);
          return false;
        }
        if (this.safeHasProperty(options, key)) {
          const value = options[key];
          if (validator.type && typeof value !== validator.type) {
            this.safeWarn('options validation', `Option '${key}' must be of type ${validator.type}`);
            return false;
          }
          if (validator.validate && !validator.validate(value)) {
            this.safeWarn('options validation', `Option '${key}' failed validation`);
            return false;
          }
        }
      }
      return true;
    } catch (error) {
      this.safeWarn('options validation', error.message, error);
      return false;
    }
  }

  /**
   * Safe performance measurement
   * @param {Function} fn - Function to measure
   * @param {string} context - Context for measurement
   * @returns {Object} Performance result
   */
  static safeMeasurePerformance(fn, context = 'operation') {
    const start = performance.now();
    const result = this.safeExecute(fn, context);
    const end = performance.now();
    return {
      result,
      duration: end - start,
      context
    };
  }

  /**
   * Safe memory usage check
   * @returns {Object} Memory usage information
   */
  static safeGetMemoryUsage() {
    return this.safeExecute(() => {
      if (typeof process !== 'undefined' && process.memoryUsage) {
        return process.memoryUsage();
      }
      return { heapUsed: 0, heapTotal: 0, external: 0, rss: 0 };
    }, 'memory usage check', { heapUsed: 0, heapTotal: 0, external: 0, rss: 0 });
  }
}

module.exports = CommonUtils;
