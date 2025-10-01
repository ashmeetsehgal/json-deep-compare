/**
 * @fileoverview Smart mode selection for optimal comparison performance
 * @author AshmeetSehgal.com
 * @description Intelligent mode selection based on object characteristics and options
 */

const CommonUtils = require('./CommonUtils');

/**
 * Smart mode selector that analyzes objects to determine optimal comparison mode
 * @private
 */
class SmartModeSelector {
  /**
   * Select the optimal comparison mode based on object characteristics
   * @param {Object} options - Comparison options
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {string} Optimal mode: 'ultraFast', 'fast', or 'full'
   */
  static selectMode(options, obj1, obj2) {
    // Fastest possible: reference equality
    if (obj1 === obj2) {
      return 'ultraFast';
    }

    // Analyze objects for optimal mode selection
    const analysis = this.analyzeObjects(obj1, obj2);
    const optionsAnalysis = this.analyzeOptions(options);

    // First check: if options require full mode, short-circuit to full
    if (optionsAnalysis.requiresFullMode) {
      return 'full';
    }

    // Ultra-fast mode: only for truly identical objects
    if (analysis.isIdentical) {
      return 'ultraFast';
    }

    // Fast mode: simple structures without advanced features
    if (analysis.isSimple && !optionsAnalysis.hasAdvancedFeatures) {
      return 'fast';
    }

    // Full mode: complex structures or advanced features
    return 'full';
  }

  /**
   * Analyze object characteristics for mode selection
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {Object} Analysis results
   */
  static analyzeObjects(obj1, obj2) {
    return {
      isIdentical: this.areObjectsIdentical(obj1, obj2),
      isSimple: this.isSimpleStructure(obj1) && this.isSimpleStructure(obj2),
      hasNestedObjects: this.hasNestedObjects(obj1) || this.hasNestedObjects(obj2),
      hasArrays: Array.isArray(obj1) || Array.isArray(obj2),
      size: this.estimateSize(obj1) + this.estimateSize(obj2)
    };
  }

  /**
   * Check if objects are truly identical (deep equality for simple cases)
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @param {WeakMap} visitedPairs - Map of obj1 -> WeakSet of obj2 to prevent circular references
   * @returns {boolean} Whether objects are identical
   */
  static areObjectsIdentical(obj1, obj2, visitedPairs = new WeakMap()) {
    // Reference equality check first
    if (obj1 === obj2) return true;
    
    // Type check
    if (typeof obj1 !== typeof obj2) return false;
    
    // Null/undefined check
    if (obj1 === null || obj2 === null) return obj1 === obj2;
    
    // Primitive types
    if (typeof obj1 !== 'object') return obj1 === obj2;
    
    // Check for circular references - only short-circuit when exact object pair has been visited
    if (visitedPairs.has(obj1) && visitedPairs.get(obj1).has(obj2)) {
      return true; // Assume equal for circular refs
    }
    
    // Add object pair to visited pairs map (only for non-null objects)
    if (typeof obj1 === 'object' && obj1 !== null && typeof obj2 === 'object' && obj2 !== null) {
      if (!visitedPairs.has(obj1)) {
        visitedPairs.set(obj1, new WeakSet());
      }
      visitedPairs.get(obj1).add(obj2);
    }
    
    // Array check
    if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
    
    // For arrays, check length and elements
    if (Array.isArray(obj1)) {
      if (obj1.length !== obj2.length) return false;
      for (let i = 0; i < obj1.length; i++) {
        if (!this.areObjectsIdentical(obj1[i], obj2[i], visitedPairs)) return false;
      }
      return true;
    }
    
    // Check for non-plain objects that need special handling
    if (!CommonUtils.isPlainObject(obj1) || !CommonUtils.isPlainObject(obj2)) {
      return this.compareNonPlainObjects(obj1, obj2);
    }
    
    // For plain objects, check keys and values
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!this.areObjectsIdentical(obj1[key], obj2[key], visitedPairs)) return false;
    }
    
    return true;
  }


  /**
   * Compare non-plain objects with type-specific logic
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @param {WeakMap} visitedPairs - Map of obj1 -> WeakSet of obj2 to prevent circular references
   * @returns {boolean} Whether objects are identical
   */
  static compareNonPlainObjects(obj1, obj2, visitedPairs = new WeakMap()) {
    // Different types are not equal
    if (obj1.constructor !== obj2.constructor) return false;
    
    // Date objects - compare timestamps
    if (obj1 instanceof Date) {
      return obj1.getTime() === obj2.getTime();
    }
    
    // RegExp objects - compare source and flags
    if (obj1 instanceof RegExp) {
      return obj1.source === obj2.source && obj1.flags === obj2.flags;
    }
    
    // Map objects - compare size and entries
    if (obj1 instanceof Map) {
      if (obj1.size !== obj2.size) return false;
      for (const [key, value] of obj1) {
        if (!obj2.has(key)) return false;
        if (!this.areObjectsIdentical(value, obj2.get(key), visitedPairs)) return false;
      }
      return true;
    }
    
    // Set objects - compare size and values
    if (obj1 instanceof Set) {
      if (obj1.size !== obj2.size) return false;
      for (const value of obj1) {
        // Use deep comparison for Set elements (O(n²) but handles objects correctly)
        let found = false;
        for (const otherValue of obj2) {
          if (this.areObjectsIdentical(value, otherValue, visitedPairs)) {
            found = true;
            break;
          }
        }
        if (!found) return false;
      }
      return true;
    }
    
    // Buffer objects - compare contents
    if (Buffer.isBuffer(obj1)) {
      return Buffer.isBuffer(obj2) && obj1.equals(obj2);
    }
    
    // ArrayBuffer objects - compare byte lengths and contents
    if (obj1 instanceof ArrayBuffer) {
      if (obj1.byteLength !== obj2.byteLength) return false;
      return new Uint8Array(obj1).every((byte, index) => 
        byte === new Uint8Array(obj2)[index]
      );
    }
    
    // TypedArray objects - compare length and elements
    if (ArrayBuffer.isView(obj1)) {
      if (!ArrayBuffer.isView(obj2)) return false;
      if (obj1.constructor !== obj2.constructor) return false;
      if (obj1.length !== obj2.length) return false;
      return obj1.every((value, index) => value === obj2[index]);
    }
    
    // Error objects - compare name, message, and stack
    if (obj1 instanceof Error) {
      return obj1.name === obj2.name && 
             obj1.message === obj2.message && 
             obj1.stack === obj2.stack;
    }
    
    // Function objects - compare string representation
    if (typeof obj1 === 'function') {
      return obj1.toString() === obj2.toString();
    }
    
    // For other non-plain objects, fall back to prototype comparison
    if (Object.getPrototypeOf(obj1) !== Object.getPrototypeOf(obj2)) {
      return false;
    }
    
    // If we reach here, treat as different (conservative approach)
    return false;
  }

  /**
   * Analyze options for mode selection
   * @param {Object} options - Comparison options
   * @returns {Object} Options analysis
   */
  static analyzeOptions(options) {
    const safeOptions = options || {};
    return {
      isBasic: !safeOptions.regexChecks || Object.keys(safeOptions.regexChecks).length === 0,
      hasAdvancedFeatures: this.hasAdvancedFeatures(safeOptions),
      requiresFullMode: this.requiresFullMode(safeOptions)
    };
  }

  /**
   * Check if an object has a simple structure suitable for fast mode
   * @param {*} obj - Object to analyze
   * @returns {boolean} Whether the object is simple
   */
  static isSimpleStructure(obj) {
    if (obj === null || obj === undefined) return true;
    if (typeof obj !== 'object') return true;
    if (Array.isArray(obj)) return obj.length < 50; // Small arrays are simple

    // Check if it's a plain object with simple values
    if (Object.getPrototypeOf(obj) !== Object.prototype) return false;

    const keys = Object.keys(obj);
    if (keys.length > 20) return false; // Too many keys

    // Check if all values are simple (no nested objects)
    for (const key of keys) {
      const value = obj[key];
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          if (value.length > 10) return false; // Large arrays
        } else if (Object.getPrototypeOf(value) !== Object.prototype) {
          return false; // Non-plain objects
        } else {
          // Any nested object makes it complex
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check if an object has nested objects
   * @param {*} obj - Object to check
   * @returns {boolean} Whether the object has nested objects
   */
  static hasNestedObjects(obj) {
    if (obj === null || obj === undefined) return false;
    if (typeof obj !== 'object') return false;
    if (Array.isArray(obj)) {
      return obj.some(item => typeof item === 'object' && item !== null);
    }

    const keys = Object.keys(obj);
    return keys.some(key => {
      const value = obj[key];
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    });
  }

  /**
   * Check if options have advanced features that require full mode
   * @param {Object} options - Options to check
   * @returns {boolean} Whether options have advanced features
   */
  static hasAdvancedFeatures(options) {
    return (
      (options.regexChecks && Object.keys(options.regexChecks).length > 0) ||
      (options.equivalentValues && Object.keys(options.equivalentValues).length > 0) ||
      (options.ignoredKeys && options.ignoredKeys.length > 0) ||
      options.matchKeysByName === true ||
      options.strictTypes === false
    );
  }

  /**
   * Check if options require full mode
   * @param {Object} options - Options to check
   * @returns {boolean} Whether full mode is required
   */
  static requiresFullMode(options) {
    return (
      this.hasAdvancedFeatures(options) ||
      (Object.prototype.hasOwnProperty.call(options, 'ignoreExtraKeys') && options.ignoreExtraKeys === false) // Full mode needed only when explicitly set to false
    );
  }

  /**
   * Estimate the size/complexity of an object
   * @param {*} obj - Object to estimate
   * @returns {number} Estimated size
   */
  static estimateSize(obj, visited = new WeakSet()) {
    if (obj === null || obj === undefined) return 0;
    if (typeof obj !== 'object') return 1;
    if (Array.isArray(obj)) return obj.length;
    
    // Check for circular references
    if (visited.has(obj)) return 0;
    visited.add(obj);
    
    const keys = Object.keys(obj);
    let size = keys.length;
    
    for (const key of keys) {
      const value = obj[key];
      if (typeof value === 'object' && value !== null) {
        size += this.estimateSize(value, visited);
      }
    }
    
    return size;
  }

  /**
   * Get mode selection statistics for debugging
   * @param {Object} options - Comparison options
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {Object} Selection statistics
   */
  static getSelectionStats(options, obj1, obj2) {
    const analysis = this.analyzeObjects(obj1, obj2);
    const optionsAnalysis = this.analyzeOptions(options);
    const selectedMode = this.selectMode(options, obj1, obj2);

    return {
      selectedMode,
      objectAnalysis: analysis,
      optionsAnalysis,
      reasoning: this.getSelectionReasoning(analysis, optionsAnalysis, selectedMode)
    };
  }

  /**
   * Get human-readable reasoning for mode selection
   * @param {Object} objectAnalysis - Object analysis results
   * @param {Object} optionsAnalysis - Options analysis results
   * @param {string} selectedMode - Selected mode
   * @returns {string} Reasoning explanation
   */
  static getSelectionReasoning(objectAnalysis, optionsAnalysis, selectedMode) {
    if (selectedMode === 'ultraFast') {
      if (objectAnalysis.isIdentical) return 'Objects are identical';
      return 'Simple objects with basic options - using ultra-fast mode';
    }

    if (selectedMode === 'fast') {
      return 'Simple objects without advanced features - using fast mode';
    }

    return 'Complex objects or advanced features - using full mode';
  }
}

module.exports = SmartModeSelector;
