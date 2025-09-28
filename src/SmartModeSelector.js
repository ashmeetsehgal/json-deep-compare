/**
 * @fileoverview Smart mode selection for optimal comparison performance
 * @author AshmeetSehgal.com
 * @description Intelligent mode selection based on object characteristics and options
 */

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

    // Ultra-fast mode: identical objects or simple structures
    if (analysis.isIdentical || (analysis.isSimple && optionsAnalysis.isBasic)) {
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
      isIdentical: obj1 === obj2,
      isSimple: this.isSimpleStructure(obj1) && this.isSimpleStructure(obj2),
      hasNestedObjects: this.hasNestedObjects(obj1) || this.hasNestedObjects(obj2),
      hasArrays: Array.isArray(obj1) || Array.isArray(obj2),
      size: this.estimateSize(obj1) + this.estimateSize(obj2)
    };
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
      options.ignoreExtraKeys === false // Full mode needed for strict key checking
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
      if (objectAnalysis.isIdentical) return 'Objects are identical (reference equality)';
      return 'Simple objects with basic options - using ultra-fast mode';
    }

    if (selectedMode === 'fast') {
      return 'Simple objects without advanced features - using fast mode';
    }

    return 'Complex objects or advanced features - using full mode';
  }
}

module.exports = SmartModeSelector;
