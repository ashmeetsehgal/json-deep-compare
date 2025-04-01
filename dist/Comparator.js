/**
 * @fileoverview Core comparison logic for JSONCompare
 * @author AshmeetSehgal.com
 */

const PathUtils = require('./PathUtils');

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
   * Compare two objects recursively
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @param {string} path - Current path in the object
   */
  compareObjects(obj1 = {}, obj2 = {}, path = '') {
    if (obj1 === null || obj2 === null) {
      this.compareValues(obj1, obj2, path);
      return;
    }

    // Handle arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      this.compareArrays(obj1, obj2, path);
      return;
    }

    // Handle different types
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      this.compareValues(obj1, obj2, path);
      return;
    }

    // Compare object keys
    const keys1 = Object.keys(obj1).filter(key => !this.options.ignoredKeys.includes(key));
    for (const key of keys1) {
      const newPath = PathUtils.buildPath(path, key);

      // Check if key exists in obj2
      if (key in obj2) {
        this.result.addMatchedKey(newPath);

        // Check value type/content
        if (typeof obj1[key] === 'object' && obj1[key] !== null && typeof obj2[key] === 'object' && obj2[key] !== null) {
          // Recursive comparison for nested objects
          this.compareObjects(obj1[key], obj2[key], newPath);
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
        if (!this.options.ignoredKeys.includes(key) && !(key in obj1)) {
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
  compareArrays(arr1, arr2, path) {
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
      if (typeof arr1[i] === 'object' && arr1[i] !== null && typeof arr2[i] === 'object' && arr2[i] !== null) {
        this.compareObjects(arr1[i], arr2[i], newPath);
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
    // Check for equivalent values as defined in options
    for (const [key, values] of Object.entries(this.options.equivalentValues)) {
      if (Array.isArray(values) && values.includes(val1) && values.includes(val2)) {
        this.result.addMatchedValue({
          path,
          value: `${val1} ≈ ${val2}`,
          message: `Values considered equivalent by rule "${key}"`
        });
        return;
      }
    }

    // Check types
    if (this.options.strictTypes && typeof val1 !== typeof val2) {
      this.result.addUnmatchedType({
        path,
        expected: typeof val1,
        actual: typeof val2,
        message: 'Types do not match'
      });
      return;
    }

    // Compare values
    if (val1 === val2) {
      this.result.addMatchedValue({
        path,
        value: val1
      });
    } else {
      this.result.addUnmatchedValue({
        path,
        expected: val1,
        actual: val2,
        message: 'Values do not match'
      });
    }

    // Perform regex checks on val2
    this.regexValidator.validateValue(val2, path);
  }
}
module.exports = Comparator;