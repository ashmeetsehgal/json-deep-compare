/**
 * @fileoverview Main JSONCompare class
 * @author AshmeetSehgal.com
 * @description This class provides methods to compare JSON objects with various options for customization.
 * @see https://ashmeetsehgal.com/tools/json-compare - Try the interactive playground
 */

const Options = require('./Options');
const Result = require('./Result');
const RegexValidator = require('./RegexValidator');
const Comparator = require('./Comparator');
const FastComparator = require('./FastComparator');
const UltraFastComparator = require('./UltraFastComparator');
const BooleanComparator = require('./BooleanComparator');

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
    this.result = new Result(this.options);
    this.regexValidator = new RegexValidator(this.options, this.result);
    this.comparator = new Comparator(this.options, this.result, this.regexValidator);
    this.useFastMode = FastComparator.shouldUseFastMode(this.options);
    this.useUltraFastMode = this.shouldUseUltraFastMode();
  }

  /**
   * Check if ultra-fast mode should be used
   * @returns {boolean} Whether to use ultra-fast mode
   */
  shouldUseUltraFastMode() {
    // Use ultra-fast mode for absolute basic comparisons
    return (!this.options.regexChecks || Object.keys(this.options.regexChecks).length === 0) &&
           (!this.options.equivalentValues || Object.keys(this.options.equivalentValues).length === 0) &&
           this.options.strictTypes === true &&  // Must be explicitly true
           (!this.options.ignoredKeys || this.options.ignoredKeys.length === 0) &&
           this.options.ignoreExtraKeys === true &&  // Must be true (default behavior)
           !this.options.matchKeysByName;
  }

  /**
   * Compare two JSON objects
   * @param {Object} obj1 - First JSON object
   * @param {Object} obj2 - Second JSON object
   * @returns {Object} Comparison result
   */
  compare(obj1, obj2) {
    // Use ultra-fast mode for absolute basic comparisons
    if (this.useUltraFastMode) {
      return UltraFastComparator.ultraFastCompareWithResult(obj1, obj2);
    }

    // Use fast mode for simple comparisons
    if (this.useFastMode) {
      const fastResult = FastComparator.fastCompare(obj1, obj2);
      return {
        matched: { keys: [], values: [] },
        unmatched: { keys: [], values: [], types: [] },
        regexChecks: { passed: [], failed: [] },
        summary: {
          matchPercentage: fastResult.matchPercentage,
          totalKeysCompared: fastResult.totalKeys,
          totalMatched: fastResult.matched,
          totalUnmatched: fastResult.unmatched,
          totalRegexChecks: 0
        }
      };
    }

    // Use full comparison for complex scenarios
    this.result.reset();
    this.comparator.compareObjects(obj1, obj2, '');
    this.result.updateSummary();
    return this.result.getResult();
  }

  /**
   * Pure boolean comparison - fastest possible
   * @param {Object} obj1 - First JSON object
   * @param {Object} obj2 - Second JSON object
   * @returns {boolean} Comparison result
   */
  isEqual(obj1, obj2) {
    return BooleanComparator.booleanCompare(obj1, obj2);
  }

  /**
   * Enhance the comparison with additional regex checks
   * @param {Object} obj1 - First object (used for comparison)
   * @param {Object} obj2 - Second object (used for regex validation)
   * @returns {Object} Enhanced result with all regex checks
   */
  compareAndValidate(obj1, obj2) {
    // If we have regex checks, we can't use fast mode
    if (this.useFastMode && (!this.options.regexChecks || Object.keys(this.options.regexChecks).length === 0)) {
      // Use fast mode for basic comparison
      const fastResult = FastComparator.fastCompare(obj1, obj2);
      return {
        matched: { keys: [], values: [] },
        unmatched: { keys: [], values: [], types: [] },
        regexChecks: { passed: [], failed: [] },
        summary: {
          matchPercentage: fastResult.matchPercentage,
          totalKeysCompared: fastResult.totalKeys,
          totalMatched: fastResult.matched,
          totalUnmatched: fastResult.unmatched,
          totalRegexChecks: 0
        }
      };
    }

    // Use full comparison for complex scenarios
    this.result.reset();
    this.comparator.compareObjects(obj1, obj2, '');
    this.regexValidator.validateAllMatchingKeys(obj2);
    this.result.updateSummary();
    return this.result.getResult();
  }
}

module.exports = JSONCompare;