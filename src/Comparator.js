/**
 * @fileoverview Core comparison logic for JSONCompare
 * @author AshmeetSehgal.com
 */

const PathUtils = require('./PathUtils');
const AdvancedCache = require('./AdvancedCache');

/**
 * Optimized type detection with caching for better performance
 * @private
 */
class TypeDetector {
  static typeCache = new WeakMap();
  static primitiveTypeCache = new Map();
  
  /**
   * Get the specific type of a value with advanced caching
   * @param {*} value - The value to check
   * @returns {string} The specific type of the value
   */
  static getType(value) {
    // Fast path for primitives (no caching needed for these)
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    const primitiveType = typeof value;
    if (primitiveType !== 'object') {
      return primitiveType; // string, number, boolean, function, etc.
    }
    
    // Check advanced cache first
    const cachedType = AdvancedCache.getCachedType(value);
    if (cachedType) {
      return cachedType;
    }
    
    // Determine type for objects
    let type;
    if (Array.isArray(value)) {
      type = 'array';
    } else if (value instanceof Date) {
      type = 'date';
    } else if (value instanceof RegExp) {
      type = 'regex';
    } else {
      // For objects, check constructor name
      const constructorName = value.constructor?.name?.toLowerCase();
      type = (constructorName && constructorName !== 'object') ? constructorName : 'object';
    }
    
    // Cache the result in both caches
    this.typeCache.set(value, type);
    AdvancedCache.cacheType(value, type);
    return type;
  }
  
  /**
   * Clear the type cache (useful for testing or memory management)
   */
  static clearCache() {
    this.typeCache = new WeakMap();
    this.primitiveTypeCache.clear();
  }
  
  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return {
      primitiveTypes: this.primitiveTypeCache.size
    };
  }
}

/**
 * Class for comparing objects
 */
class Comparator {
  /**
   * Creates a new Comparator instance
   * @param {Object} options - Options instance
   * @param {Object} result - Result instance
   * @param {Object} regexValidator - RegexValidator instance
   */
  constructor(options, result, regexValidator) {
    this.options = options;
    this.result = result;
    this.regexValidator = regexValidator;
  }

  /**
   * Get the specific type of a value using optimized type detection
   * @param {*} value - The value to check
   * @returns {string} The specific type of the value (string, number, array, object, null, etc.)
   */
  getValueType(value) {
    return TypeDetector.getType(value);
  }

  /**
   * Compare two objects recursively
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @param {string} path - Current path in the object
   * @param {WeakMap} visitedPairs - Map of obj1 -> WeakSet of obj2 to prevent circular references
   */
  compareObjects(obj1 = {}, obj2 = {}, path = '', visitedPairs = new WeakMap()) {
    if (obj1 === null || obj2 === null) {
      this.compareValues(obj1, obj2, path);
      return;
    }

    // Check for circular references - only short-circuit when exact object pair has been visited
    if (visitedPairs.has(obj1) && visitedPairs.get(obj1).has(obj2)) {
      this.result.addMatchedValue({
        path,
        value: '[Circular Reference]',
        type1: 'circular',
        type2: 'circular',
        message: 'Circular reference detected - objects are considered equal'
      });
      return;
    }

    // Add object pair to visited pairs map (only for non-null objects)
    if (typeof obj1 === 'object' && obj1 !== null && typeof obj2 === 'object' && obj2 !== null) {
      if (!visitedPairs.has(obj1)) {
        visitedPairs.set(obj1, new WeakSet());
      }
      visitedPairs.get(obj1).add(obj2);
    }

    // Handle arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      this.compareArrays(obj1, obj2, path, visitedPairs);
      return;
    }

    // Handle different types
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      this.compareValues(obj1, obj2, path);
      return;
    }

    // Compare object keys
    const keys1 = Object.keys(obj1).filter(key => !(this.options.ignoredKeys || []).includes(key));
    
    for (const key of keys1) {
      const newPath = PathUtils.buildPath(path, key);
      
      // Check if key exists in obj2
      if (key in obj2) {
        this.result.addMatchedKey(newPath);
        
        // Check value type/content
        if (typeof obj1[key] === 'object' && obj1[key] !== null && 
            typeof obj2[key] === 'object' && obj2[key] !== null) {
          // Recursive comparison for nested objects
          this.compareObjects(obj1[key], obj2[key], newPath, visitedPairs);
        } else {
          this.compareValues(obj1[key], obj2[key], newPath);
        }
      } else {
        this.result.addUnmatchedKey({
          path: newPath,
          value: obj1[key],
          message: `Key exists in object 1 but not in object 2`
        });
      }
    }

    // Check for extra keys in obj2 if not ignoring them
    if (!this.options.ignoreExtraKeys) {
      for (const key of Object.keys(obj2)) {
        if (!(this.options.ignoredKeys || []).includes(key) && !(key in obj1)) {
          const newPath = PathUtils.buildPath(path, key);
          this.result.addUnmatchedKey({
            path: newPath,
            value: obj2[key],
            message: `Key exists in object 2 but not in object 1`
          });
        }
      }
    }
  }

  /**
   * Compare two arrays
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @param {string} path - Current path
   */
  compareArrays(arr1, arr2, path, visitedPairs = new WeakMap()) {
    // Check if array lengths match
    if (arr1.length !== arr2.length) {
      this.result.addUnmatchedValue({
        path,
        expected: `Array of length ${arr1.length}`,
        actual: `Array of length ${arr2.length}`,
        message: 'Array lengths do not match'
      });
    }

    // Compare array elements
    const minLength = Math.min(arr1.length, arr2.length);
    for (let i = 0; i < minLength; i++) {
      const newPath = PathUtils.buildArrayPath(path, i);
      if (typeof arr1[i] === 'object' && arr1[i] !== null && 
          typeof arr2[i] === 'object' && arr2[i] !== null) {
        this.compareObjects(arr1[i], arr2[i], newPath, visitedPairs);
      } else {
        this.compareValues(arr1[i], arr2[i], newPath);
      }
    }

    // Report extra elements
    for (let i = minLength; i < arr1.length; i++) {
      const newPath = PathUtils.buildArrayPath(path, i);
      this.result.addUnmatchedValue({
        path: newPath,
        expected: arr1[i],
        actual: undefined,
        message: 'Extra element in first array'
      });
    }

    for (let i = minLength; i < arr2.length; i++) {
      const newPath = PathUtils.buildArrayPath(path, i);
      this.result.addUnmatchedValue({
        path: newPath,
        expected: undefined,
        actual: arr2[i],
        message: 'Extra element in second array'
      });
    }
  }

  /**
   * Compare two primitive values
   * @param {*} val1 - First value
   * @param {*} val2 - Second value
   * @param {string} path - Current path
   */
  compareValues(val1, val2, path) {
    // Get specific types
    const type1 = this.getValueType(val1);
    const type2 = this.getValueType(val2);

    // Check for equivalent values as defined in options
    for (const [key, values] of Object.entries(this.options.equivalentValues || {})) {
      if (Array.isArray(values) && values.includes(val1) && values.includes(val2)) {
        this.result.addMatchedValue({
          path,
          value: `${val1} ≈ ${val2}`,
          type1,
          type2,
          message: `Values considered equivalent by rule "${key}"`
        });
        return;
      }
    }

    // Check specific types
    if (type1 !== type2) {
      this.result.addUnmatchedType({
        path,
        expected: type1,
        actual: type2,
        message: `Types do not match: expected '${type1}', got '${type2}'`
      });
      
      if (this.options.strictTypes) {
        return; // Stop comparison if strict type checking is enabled
      }
    }

    // Compare values - use strict equality for strict mode, loose equality for non-strict mode
    let valuesMatch;
    if (this.options.strictTypes) {
      valuesMatch = val1 === val2;
    } else {
      // Use loose equality (==) for non-strict mode, which will convert types
      valuesMatch = val1 == val2;
    }

    if (valuesMatch) {
      this.result.addMatchedValue({
        path,
        value: val1,
        type: type1 
      });
    } else {
      this.result.addUnmatchedValue({
        path,
        expected: val1,
        actual: val2,
        expectedType: type1,
        actualType: type2,
        message: 'Values do not match'
      });
    }

    // Perform regex checks on val2
    this.regexValidator.validateValue(val2, path);
  }
}

module.exports = Comparator;