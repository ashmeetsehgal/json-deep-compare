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
   */
  constructor() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.ignoredKeys = options.ignoredKeys || [];
    this.equivalentValues = options.equivalentValues || {};
    this.regexChecks = options.regexChecks || {};
    this.strictTypes = options.strictTypes !== undefined ? options.strictTypes : true;
    this.ignoreExtraKeys = options.ignoreExtraKeys || false;
    this.matchKeysByName = options.matchKeysByName !== undefined ? options.matchKeysByName : false;
    this._compileRegexPatterns();
  }

  /**
   * Compile regex patterns if they're provided as strings
   * @private
   */
  _compileRegexPatterns() {
    for (var key in this.regexChecks) {
      if (typeof this.regexChecks[key] === 'string') {
        this.regexChecks[key] = new RegExp(this.regexChecks[key]);
      }
    }
  }
}
module.exports = Options;