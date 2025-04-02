/**
 * @fileoverview Result handler for JSONCompare
 * @author AshmeetSehgal.com
 */

/**
 * Class for managing JSON comparison results
 */
class Result {
  /**
   * Creates a new Result instance
   * @param {Object} options - Options instance for result calculation
   */
  constructor() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.options = options;
    this.reset();
  }

  /**
   * Reset the result structure
   */
  reset() {
    this.data = {
      matched: {
        keys: [],
        values: []
      },
      unmatched: {
        keys: [],
        values: [],
        types: []
      },
      regexChecks: {
        passed: [],
        failed: []
      },
      summary: {
        matchPercentage: 0,
        totalKeysCompared: 0,
        totalMatched: 0,
        totalUnmatched: 0,
        totalRegexChecks: 0
      }
    };
  }

  /**
   * Add a matched key
   * @param {string} path - Path of the key
   */
  addMatchedKey(path) {
    this.data.matched.keys.push(path);
  }

  /**
   * Add a matched value
   * @param {Object} match - Details about the matched value
   * @param {string} match.path - Path of the value
   * @param {*} match.value - The value
   * @param {string} [match.message] - Optional message
   */
  addMatchedValue(match) {
    this.data.matched.values.push(match);
  }

  /**
   * Add an unmatched key
   * @param {Object} unmatch - Details about the unmatched key
   * @param {string} unmatch.path - Path of the key
   * @param {*} unmatch.value - The value of the key
   * @param {string} unmatch.message - Explanation message
   */
  addUnmatchedKey(unmatch) {
    this.data.unmatched.keys.push(unmatch);
  }

  /**
   * Add an unmatched value
   * @param {Object} unmatch - Details about the unmatched value
   * @param {string} unmatch.path - Path of the value
   * @param {*} unmatch.expected - Expected value
   * @param {*} unmatch.actual - Actual value
   * @param {string} unmatch.message - Explanation message
   */
  addUnmatchedValue(unmatch) {
    this.data.unmatched.values.push(unmatch);
  }

  /**
   * Add an unmatched type
   * @param {Object} unmatch - Details about the unmatched type
   * @param {string} unmatch.path - Path of the value
   * @param {string} unmatch.expected - Expected type
   * @param {string} unmatch.actual - Actual type
   * @param {string} unmatch.message - Explanation message
   */
  addUnmatchedType(unmatch) {
    this.data.unmatched.types.push(unmatch);
  }

  /**
   * Add a passed regex check
   * @param {Object} check - Details about the passed regex check
   * @param {string} check.path - Path of the value
   * @param {string} check.value - The value checked
   * @param {string} check.pattern - The regex pattern used
   * @param {boolean} [check.matchedByName] - Whether matched by key name
   */
  addPassedRegexCheck(check) {
    this.data.regexChecks.passed.push(check);
  }

  /**
   * Add a failed regex check
   * @param {Object} check - Details about the failed regex check
   * @param {string} check.path - Path of the value
   * @param {string} check.value - The value checked
   * @param {string} check.pattern - The regex pattern used
   * @param {string} check.message - Explanation message
   * @param {boolean} [check.matchedByName] - Whether matched by key name
   */
  addFailedRegexCheck(check) {
    this.data.regexChecks.failed.push(check);
  }

  /**
   * Calculate and update the summary
   */
  updateSummary() {
    var totalMatched = this.data.matched.keys.length;

    // If strictTypes is false, don't count type mismatches as unmatched items
    var strictTypes = this.options.strictTypes !== undefined ? this.options.strictTypes : true;
    var unmatchedTypesCount = strictTypes ? this.data.unmatched.types.length : 0;
    var totalUnmatched = this.data.unmatched.keys.length + this.data.unmatched.values.length + unmatchedTypesCount;
    var totalKeysCompared = totalMatched + totalUnmatched;
    var totalRegexChecks = this.data.regexChecks.passed.length + this.data.regexChecks.failed.length;
    this.data.summary = {
      matchPercentage: totalKeysCompared > 0 ? totalMatched / totalKeysCompared * 100 : 100,
      totalKeysCompared,
      totalMatched,
      totalUnmatched,
      totalRegexChecks
    };
  }

  /**
   * Get the full result
   * @returns {Object} Full result structure
   */
  getResult() {
    return this.data;
  }
}
module.exports = Result;