/**
 * @fileoverview Main JSONCompare class
 * @author AshmeetSehgal.com
 * @version 1.0.0
 */

const Options = require('./Options');
const Result = require('./Result');
const RegexValidator = require('./RegexValidator');
const Comparator = require('./Comparator');

/**
 * Class for comparing JSON objects
 */
class JSONCompare {
  /**
   * Creates a new JSONCompare instance
   * @param {Object} options - Configuration options
   * @param {string[]} [options.ignoredKeys=[]] - Keys to ignore during comparison
   * @param {Object} [options.equivalentValues={}] - Values to treat as equivalent
   * @param {Object} [options.regexChecks={}] - Regex patterns for value validation
   * @param {boolean} [options.strictTypes=true] - Whether to strictly compare types
   * @param {boolean} [options.ignoreExtraKeys=false] - Whether to ignore keys in obj2 that aren't in obj1
   * @param {boolean} [options.matchKeysByName=false] - Whether to match regex by key name instead of only by path
   */
  constructor(options = {}) {
    this.options = new Options(options);
    this.result = new Result();
    this.regexValidator = new RegexValidator(this.options, this.result);
    this.comparator = new Comparator(this.options, this.result, this.regexValidator);
  }

  /**
   * Compare two JSON objects
   * @param {Object} obj1 - First JSON object
   * @param {Object} obj2 - Second JSON object
   * @returns {Object} Comparison result
   */
  compare(obj1, obj2) {
    this.result.reset();
    this.comparator.compareObjects(obj1, obj2, '');
    this.result.updateSummary();
    return this.result.getResult();
  }

  /**
   * Enhance the comparison with additional regex checks
   * @param {Object} obj1 - First object (used for comparison)
   * @param {Object} obj2 - Second object (used for regex validation)
   * @returns {Object} Enhanced result with all regex checks
   */
  compareAndValidate(obj1, obj2) {
    this.compare(obj1, obj2);
    this.regexValidator.validateAllMatchingKeys(obj2);
    this.result.updateSummary();
    return this.result.getResult();
  }
}

module.exports = JSONCompare;