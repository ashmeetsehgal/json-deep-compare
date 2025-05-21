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
   * Get the specific type of a value
   * @param {*} value - The value to check
   * @returns {string} The specific type of the value (string, number, array, object, null, etc.)
   */
  getValueType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'date';
    if (value instanceof RegExp) return 'regex';
    
    const type = typeof value;
    
    // For objects, we return 'object' unless it's a special built-in object
    if (type === 'object') {
      const constructor = value.constructor.name.toLowerCase();
      return constructor !== 'object' ? constructor : 'object';
    }
    
    return type; // string, number, boolean, undefined, function, etc.
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
        if (typeof obj1[key] === 'object' && obj1[key] !== null && 
            typeof obj2[key] === 'object' && obj2[key] !== null) {
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
    const strategy = this.options.arrayComparisonStrategies[path] || { type: 'exact' };

    switch (strategy.type) {
      case 'set':
        this._compareArraysAsSet(arr1, arr2, path, strategy);
        break;
      case 'key':
        this._compareArraysByKey(arr1, arr2, path, strategy);
        break;
      case 'exact':
      default:
        this._compareArraysExact(arr1, arr2, path);
        break;
    }
  }

  /**
   * Compare two arrays element by element in order.
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @param {string} path - Current path
   * @private
   */
  _compareArraysExact(arr1, arr2, path) {
    // Check if array lengths match
    if (arr1.length !== arr2.length) {
      this.result.addUnmatchedValue({
        path,
        expected: `Array of length ${arr1.length}`,
        actual: `Array of length ${arr2.length}`,
        message: 'Array lengths do not match (exact comparison)'
      });
    }

    // Compare array elements
    const minLength = Math.min(arr1.length, arr2.length);
    for (let i = 0; i < minLength; i++) {
      const newPath = PathUtils.buildArrayPath(path, i);
      if (typeof arr1[i] === 'object' && arr1[i] !== null &&
          typeof arr2[i] === 'object' && arr2[i] !== null) {
        this.compareObjects(arr1[i], arr2[i], newPath);
      } else {
        this.compareValues(arr1[i], arr2[i], newPath);
      }
    }

    // Report extra elements
    if (arr1.length > minLength) {
      for (let i = minLength; i < arr1.length; i++) {
        const newPath = PathUtils.buildArrayPath(path, i);
        this.result.addUnmatchedValue({
          path: newPath,
          expected: arr1[i],
          actual: undefined,
          message: 'Extra element in first array (exact comparison)'
        });
      }
    }

    if (arr2.length > minLength) {
      for (let i = minLength; i < arr2.length; i++) {
        const newPath = PathUtils.buildArrayPath(path, i);
        this.result.addUnmatchedValue({
          path: newPath,
          expected: undefined,
          actual: arr2[i],
          message: 'Extra element in second array (exact comparison)'
        });
      }
    }
  }

  /**
   * Compare two arrays as sets (order doesn't matter).
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @param {string} path - Current path
   * @param {Object} strategy - The strategy object (unused here but kept for consistency)
   * @private
   */
  _compareArraysAsSet(arr1, arr2, path, strategy) {
    if (arr1.length !== arr2.length) {
      this.result.addUnmatchedValue({
        path,
        expected: `Array of length ${arr1.length}`,
        actual: `Array of length ${arr2.length}`,
        message: 'Array lengths do not match for set comparison'
      });
      // For set comparison, different lengths mean they are definitely not equal as sets.
      // However, we can still report which elements are missing or extra if we proceed.
      // For now, per instruction, returning early.
      return;
    }

    const map1 = new Map();
    const map2 = new Map();

    const getElementKey = (el) => {
      const type = this.getValueType(el);
      return type === 'object' || type === 'array' ? JSON.stringify(el) : el;
    };

    for (const el of arr1) {
      const key = getElementKey(el);
      map1.set(key, (map1.get(key) || 0) + 1);
    }

    for (const el of arr2) {
      const key = getElementKey(el);
      map2.set(key, (map2.get(key) || 0) + 1);
    }

    let allMatch = true;
    for (const [key, count1] of map1) {
      const count2 = map2.get(key) || 0;
      if (count1 !== count2) {
        allMatch = false;
        this.result.addUnmatchedValue({
          path: path, // Report against the array path itself
          expected: `Element '${key}' count: ${count1}`,
          actual: `Element '${key}' count: ${count2}`,
          message: `Set comparison failed for array at path '${path}': Element '${key}' has count ${count1} in first array and count ${count2} in second array.`
        });
      }
    }

    for (const [key, count2] of map2) {
      if (!map1.has(key)) { // This case implies count1 was 0
        allMatch = false;
        this.result.addUnmatchedValue({
          path: path, // Report against the array path itself
          expected: `Element '${key}' count: 0 (not present in first array)`,
          actual: `Element '${key}' count: ${count2} (present in second array)`,
          message: `Set comparison failed for array at path '${path}': Element '${key}' is present in second array (count ${count2}) but not in first.`
        });
      }
    }
    
    if (allMatch && arr1.length === arr2.length) {
        this.result.addMatchedValue({
            path,
            value: `Arrays at path '${path}' successfully compared as sets (length ${arr1.length})`,
            type1: 'array',
            type2: 'array',
            message: `Arrays at path '${path}' are equivalent when compared as sets.`
        });
    }
  }

  /**
   * Compare two arrays of objects by a specified key.
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @param {string} path - Current path
   * @param {Object} strategy - The strategy object, must contain `keyName`
   * @private
   */
  _compareArraysByKey(arr1, arr2, path, strategy) {
    const keyName = strategy.keyName;

    if (!keyName || typeof keyName !== 'string') {
      this.result.addUnmatchedValue({ // Or a more specific error type
        path,
        message: `Invalid keyName '${keyName}' for array key comparison. Falling back to exact comparison.`,
        expected: 'Valid keyName string',
        actual: keyName
      });
      this._compareArraysExact(arr1, arr2, path); // Fallback
      return;
    }

    const map1 = new Map();
    const unkeyable1 = [];
    const duplicateKeys1 = new Set();

    for (let i = 0; i < arr1.length; i++) {
      const el = arr1[i];
      if (typeof el !== 'object' || el === null) {
        unkeyable1.push({ index: i, value: el });
        continue;
      }
      const keyValue = el[keyName];
      if (keyValue === undefined || keyValue === null) {
        unkeyable1.push({ index: i, value: el, keyName });
        continue;
      }
      if (map1.has(keyValue)) {
        duplicateKeys1.add(keyValue);
      }
      map1.set(keyValue, el);
    }

    const map2 = new Map();
    const unkeyable2 = [];
    const duplicateKeys2 = new Set();

    for (let i = 0; i < arr2.length; i++) {
      const el = arr2[i];
      if (typeof el !== 'object' || el === null) {
        unkeyable2.push({ index: i, value: el });
        continue;
      }
      const keyValue = el[keyName];
      if (keyValue === undefined || keyValue === null) {
        unkeyable2.push({ index: i, value: el, keyName });
        continue;
      }
      if (map2.has(keyValue)) {
        duplicateKeys2.add(keyValue);
      }
      map2.set(keyValue, el);
    }
    
    // Report unkeyable elements
    unkeyable1.forEach(item => {
        this.result.addUnmatchedValue({ // Using addUnmatchedValue as it's a value-level issue for keying
            path: PathUtils.buildArrayPath(path, item.index), // Path to the specific unkeyable element
            expected: item.value,
            actual: `Unkeyable (key: '${keyName}')`,
            message: `Element at index ${item.index} in first array at path '${path}' is not an object or is missing the key '${keyName}', cannot be used in key-based comparison.`
        });
    });
    unkeyable2.forEach(item => {
        this.result.addUnmatchedValue({
            path: PathUtils.buildArrayPath(path, item.index), // Path to the specific unkeyable element
            expected: `Unkeyable (key: '${keyName}')`,
            actual: item.value,
            message: `Element at index ${item.index} in second array at path '${path}' is not an object or is missing the key '${keyName}', cannot be used in key-based comparison.`
        });
    });

    // Report duplicate keys
    duplicateKeys1.forEach(key => {
        this.result.addUnmatchedValue({ // Using addUnmatchedValue for consistency, though it's a structural issue for the array
            path: path, // Path of the array itself
            expected: `Key '${key}' to be unique in first array`,
            actual: `Key '${key}' is duplicated in first array`,
            message: `Duplicate key '${key}' found in first array during key-based comparison at path '${path}'.`
        });
    });
    duplicateKeys2.forEach(key => {
        this.result.addUnmatchedValue({
            path: path, // Path of the array itself
            expected: `Key '${key}' to be unique in second array`,
            actual: `Key '${key}' is duplicated in second array`,
            message: `Duplicate key '${key}' found in second array during key-based comparison at path '${path}'.`
        });
    });

    // If there are unkeyable elements or duplicates, it might be hard to proceed meaningfully for a strict key comparison.
    // For now, we proceed with comparison of keyed elements.
    let comparisonSuccessful = unkeyable1.length === 0 && unkeyable2.length === 0 &&
                             duplicateKeys1.size === 0 && duplicateKeys2.size === 0;
    let itemsMatched = 0;
    
    const allKeys = new Set([...map1.keys(), ...map2.keys()]);

    for (const key of allKeys) {
      const el1 = map1.get(key);
      const el2 = map2.get(key);
      const keyedPath = PathUtils.buildPath(path, `[${keyName}=${key}]`);

      if (el1 !== undefined && el2 !== undefined) {
        // this.result.addMatchedKey(keyedPath); // Not adding matched key here, compareObjects will handle it.
        this.compareObjects(el1, el2, keyedPath);
        itemsMatched++; // Count successfully matched pairs for overall assessment later.
      } else if (el1 !== undefined) {
        comparisonSuccessful = false;
        this.result.addUnmatchedValue({ // Changed from addUnmatchedKey
          path: keyedPath,
          expected: el1,
          actual: undefined,
          message: `Element with key '${key}' exists in first array at path '${path}' but not in second (key-based comparison).`
        });
      } else { // el2 !== undefined
        comparisonSuccessful = false;
        this.result.addUnmatchedValue({ // Changed from addUnmatchedKey
          path: keyedPath,
          expected: undefined,
          actual: el2,
          message: `Element with key '${key}' exists in second array at path '${path}' but not in first (key-based comparison).`
        });
      }
    }

    const keyableLength1 = arr1.length - unkeyable1.length;
    const keyableLength2 = arr2.length - unkeyable2.length;

    if (keyableLength1 !== keyableLength2 && comparisonSuccessful) { // Only if no other structural issues were found earlier
        comparisonSuccessful = false;
        this.result.addUnmatchedValue({
            path,
            expected: `Array of ${keyableLength1} keyable items (using key '${keyName}')`,
            actual: `Array of ${keyableLength2} keyable items (using key '${keyName}')`,
            message: `Effective array lengths (after filtering unkeyable items) do not match at path '${path}' for key-based comparison.`
        });
    }
    
    // A key-based comparison is successful if no unkeyable/duplicates, all keys match, 
    // and all sub-object comparisons pass (this last part is implicitly handled by recursive calls).
    // We also check if the number of matched items corresponds to the number of unique keys from both maps.
    if (comparisonSuccessful && itemsMatched === allKeys.size && keyableLength1 === keyableLength2) {
        this.result.addMatchedValue({
            path,
            value: `Arrays at path '${path}' successfully compared by key '${keyName}' (items: ${itemsMatched})`,
            type1: 'array',
            type2: 'array',
            message: `Arrays at path '${path}' are equivalent when compared by key '${keyName}'.`
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
    for (const [key, values] of Object.entries(this.options.equivalentValues)) {
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