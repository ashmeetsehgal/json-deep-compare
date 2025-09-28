/**
 * @fileoverview Regex validation utilities for JSONCompare
 * @author AshmeetSehgal.com
 */

const PathUtils = require('./PathUtils');

/**
 * Global regex cache to avoid recompilation of patterns
 * @private
 */
class RegexCache {
  static cache = new Map();
  
  /**
   * Get or compile a regex pattern
   * @param {string|RegExp} pattern - Pattern to compile
   * @returns {RegExp} Compiled regex
   */
  static getRegex(pattern) {
    if (pattern instanceof RegExp) {
      return pattern;
    }
    
    const patternString = pattern.toString();
    if (!this.cache.has(patternString)) {
      this.cache.set(patternString, new RegExp(pattern));
    }
    return this.cache.get(patternString);
  }
  
  /**
   * Clear the cache (useful for testing)
   */
  static clear() {
    this.cache.clear();
  }
  
  /**
   * Get cache size (useful for monitoring)
   */
  static size() {
    return this.cache.size;
  }
}

/**
 * Class for handling regex validation
 */
class RegexValidator {
  /**
   * Creates a new RegexValidator instance
   * @param {Object} options - Options instance
   * @param {Object} result - Result instance
   */
  constructor(options, result) {
    this.options = options;
    this.result = result;
    
    // Pre-compile and cache all regex patterns for better performance
    this.compiledRegexChecks = {};
    for (const [key, pattern] of Object.entries(this.options.regexChecks || {})) {
      this.compiledRegexChecks[key] = RegexCache.getRegex(pattern);
    }
  }

  /**
   * Perform regex validation on a value
   * @param {*} value - Value to validate
   * @param {string} path - Path to the value
   */
  validateValue(value, path) {
    if (typeof value !== 'string') {
      return;
    }

    // Check exact path match using pre-compiled regex patterns
    for (const [keyPath, regex] of Object.entries(this.compiledRegexChecks)) {
      let shouldCheck = false;
      
      // Exact path match
      if (keyPath === path) {
        shouldCheck = true;
      } 
      // Key name match (when enabled)
      else if (this.options.matchKeysByName) {
        const keyName = PathUtils.getKeyNameFromPath(path);
        if (keyName === keyPath) {
          shouldCheck = true;
        }
      }

      if (shouldCheck) {
        this._checkRegex(value, path, regex);
      }
    }
  }

  /**
   * Check a value against a regex pattern
   * @param {string} value - Value to check
   * @param {string} path - Path to the value
   * @param {RegExp} regex - Regex pattern
   * @private
   */
  _checkRegex(value, path, regex) {
    if (regex.test(value)) {
      this.result.addPassedRegexCheck({
        path,
        value,
        pattern: regex.toString()
      });
    } else {
      this.result.addFailedRegexCheck({
        path,
        value,
        pattern: regex.toString(),
        message: `Value does not match regex pattern`
      });
    }
  }

  /**
   * Find and validate all values matching a key name with the associated regex pattern
   * @param {Object} obj - Object to scan
   */
  validateAllMatchingKeys(obj) {
    // Skip if matchKeysByName is disabled
    if (!this.options.matchKeysByName) {
      return;
    }

    const paths = PathUtils.getAllPaths(obj);
    
    // For each regex check by key name using pre-compiled patterns
    for (const [keyName, regex] of Object.entries(this.compiledRegexChecks)) {
      // Find all paths that end with the key name
      const matchingPaths = paths.filter(path => {
        const lastPart = PathUtils.getKeyNameFromPath(path);
        return lastPart === keyName;
      });

      // Validate each matching path
      for (const path of matchingPaths) {
        const value = PathUtils.getValueAtPath(obj, path);
        if (typeof value === 'string') {
          const alreadyChecked = this._isPathChecked(path);
          if (!alreadyChecked) {
            if (regex.test(value)) {
              this.result.addPassedRegexCheck({
                path,
                value,
                pattern: regex.toString(),
                matchedByName: true
              });
            } else {
              this.result.addFailedRegexCheck({
                path,
                value,
                pattern: regex.toString(),
                message: `Value does not match regex pattern`,
                matchedByName: true
              });
            }
          }
        }
      }
    }
  }

  /**
   * Check if a path was already validated
   * @param {string} path - Path to check
   * @returns {boolean} Whether the path was already checked
   * @private
   */
  _isPathChecked(path) {
    const result = this.result.getResult();
    return result.regexChecks.passed.some(item => item.path === path) ||
           result.regexChecks.failed.some(item => item.path === path);
  }
}

module.exports = RegexValidator;