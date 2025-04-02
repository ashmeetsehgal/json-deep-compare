/**
 * @fileoverview Regex validation utilities for JSONCompare
 * @author AshmeetSehgal.com
 */

var PathUtils = require('./PathUtils');

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

    // Check exact path match
    for (var [keyPath, regex] of Object.entries(this.options.regexChecks)) {
      var shouldCheck = false;

      // Exact path match
      if (keyPath === path) {
        shouldCheck = true;
      }
      // Key name match (when enabled)
      else if (this.options.matchKeysByName) {
        var keyName = PathUtils.getKeyNameFromPath(path);
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
        message: "Value does not match regex pattern"
      });
    }
  }

  /**
   * Find and validate all values matching a key name with the associated regex pattern
   * @param {Object} obj - Object to scan
   */
  validateAllMatchingKeys(obj) {
    var _this = this;
    // Skip if matchKeysByName is disabled
    if (!this.options.matchKeysByName) {
      return;
    }
    var paths = PathUtils.getAllPaths(obj);

    // For each regex check by key name
    var _loop = function _loop(keyName) {
      // Find all paths that end with the key name
      var matchingPaths = paths.filter(path => {
        var lastPart = PathUtils.getKeyNameFromPath(path);
        return lastPart === keyName;
      });

      // Validate each matching path
      for (var path of matchingPaths) {
        var value = PathUtils.getValueAtPath(obj, path);
        if (typeof value === 'string') {
          var alreadyChecked = _this._isPathChecked(path);
          if (!alreadyChecked) {
            if (regex.test(value)) {
              _this.result.addPassedRegexCheck({
                path,
                value,
                pattern: regex.toString(),
                matchedByName: true
              });
            } else {
              _this.result.addFailedRegexCheck({
                path,
                value,
                pattern: regex.toString(),
                message: "Value does not match regex pattern",
                matchedByName: true
              });
            }
          }
        }
      }
    };
    for (var [keyName, regex] of Object.entries(this.options.regexChecks)) {
      _loop(keyName);
    }
  }

  /**
   * Check if a path was already validated
   * @param {string} path - Path to check
   * @returns {boolean} Whether the path was already checked
   * @private
   */
  _isPathChecked(path) {
    var result = this.result.getResult();
    return result.regexChecks.passed.some(item => item.path === path) || result.regexChecks.failed.some(item => item.path === path);
  }
}
module.exports = RegexValidator;