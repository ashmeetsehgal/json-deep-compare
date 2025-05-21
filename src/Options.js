/**
 * @fileoverview Options handler for JSONCompare
 * @author AshmeetSehgal.com
 */

/**
 * Class for handling JSONCompare options
 */
class Options {
  /**
   * Creates a new Options instance
   * @param {Object} options - Configuration options
   * @param {string[]} [options.ignoredKeys=[]] - Keys to ignore during comparison
   * @param {Object} [options.equivalentValues={}] - Values to treat as equivalent
   * @param {Object} [options.regexChecks={}] - Regex patterns for value validation
   * @param {boolean} [options.strictTypes=true] - Whether to strictly compare types
   * @param {boolean} [options.ignoreExtraKeys=false] - Whether to ignore keys in obj2 that aren't in obj1
   * @param {boolean} [options.matchKeysByName=false] - Whether to match regex by key name instead of only by path
   * @param {Object} [options.arrayComparisonStrategies={}] - Strategies for comparing arrays at specific paths.
   *   Keys are path strings (e.g., "users.items"), and values are strategy objects.
   *   Supported strategy types:
   *   - `{ type: 'exact' }`: (Default) Arrays must have elements in the same order and with the same values.
   *   - `{ type: 'set' }`: Arrays are treated as sets; order doesn't matter, but all elements must be present in both.
   *   - `{ type: 'key', keyName: 'yourKey' }`: Arrays of objects are compared by matching objects based on the value of `keyName`.
   */
  constructor(options = {}) {
    this.ignoredKeys = options.ignoredKeys || [];
    this.equivalentValues = options.equivalentValues || {};
    this.regexChecks = options.regexChecks || {};
    this.strictTypes = options.strictTypes !== undefined ? options.strictTypes : true;
    this.ignoreExtraKeys = options.ignoreExtraKeys || false;
    this.matchKeysByName = options.matchKeysByName !== undefined ? options.matchKeysByName : false;
    this.arrayComparisonStrategies = options.arrayComparisonStrategies || {};

    this._compileRegexPatterns();
  }

  /**
   * Compile regex patterns if they're provided as strings
   * @private
   */
  _compileRegexPatterns() {
    for (const key in this.regexChecks) {
      if (typeof this.regexChecks[key] === 'string') {
        this.regexChecks[key] = new RegExp(this.regexChecks[key]);
      }
    }
  }
}

module.exports = Options;