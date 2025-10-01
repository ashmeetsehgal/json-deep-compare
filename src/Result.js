/**
 * @fileoverview Result handler for JSONCompare
 * @author AshmeetSehgal.com
 */

/**
 * Object pool for Result instances to reduce garbage collection overhead
 * @private
 */
class ResultPool {
  static pool = [];
  static maxPoolSize = 50; // Prevent memory leaks from unbounded growth
  static created = 0;
  static reused = 0;

  /**
   * Get a Result instance from the pool or create a new one
   * @param {Object} options - Options for the Result instance
   * @returns {Result} A Result instance
   */
  static acquire(options = {}) {
    let result;
    if (this.pool.length > 0) {
      result = this.pool.pop();
      result.options = options;
      result.reset();
      this.reused++;
    } else {
      result = new Result(options);
      this.created++;
    }
    return result;
  }

  /**
   * Return a Result instance to the pool
   * @param {Result} result - The Result instance to return
   */
  static release(result) {
    if (this.pool.length < this.maxPoolSize) {
      // Clear sensitive data before returning to pool
      result.reset();
      result.options = {};
      this.pool.push(result);
    }
    // If pool is full, let it be garbage collected
  }

  /**
   * Clear the entire pool (useful for testing or memory management)
   */
  static clear() {
    this.pool.length = 0;
    this.created = 0;
    this.reused = 0;
  }

  /**
   * Get pool statistics
   * @returns {Object} Pool statistics
   */
  static getStats() {
    return {
      poolSize: this.pool.length,
      maxPoolSize: this.maxPoolSize,
      totalCreated: this.created,
      totalReused: this.reused,
      reuseRatio: this.created > 0 ? this.reused / this.created : 0
    };
  }
}

/**
 * Class for managing JSON comparison results
 */
class Result {
  /**
   * Creates a new Result instance
   * @param {Object} options - Options instance for result calculation
   */
  constructor(options = {}) {
    this.options = options;
    this.reset();
  }

  /**
   * Create a new Result instance using object pooling
   * @param {Object} options - Options instance for result calculation
   * @returns {Result} A Result instance from the pool
   * @static
   */
  static create(options = {}) {
    return ResultPool.acquire(options);
  }

  /**
   * Release this Result instance back to the pool
   * @returns {Object} The final result data before release
   */
  release() {
    const finalResult = this.getResult();
    ResultPool.release(this);
    return finalResult;
  }

  /**
   * Reset the result structure with optimized array clearing
   */
  reset() {
    // Reuse existing arrays when possible to reduce allocation
    if (this.data) {
      // Clear arrays efficiently
      this.data.matched.keys.length = 0;
      this.data.matched.values.length = 0;
      this.data.unmatched.keys.length = 0;
      this.data.unmatched.values.length = 0;
      this.data.unmatched.types.length = 0;
      this.data.regexChecks.passed.length = 0;
      this.data.regexChecks.failed.length = 0;
      
      // Reset summary
      this.data.summary.matchPercentage = 0;
      this.data.summary.totalKeysCompared = 0;
      this.data.summary.totalMatched = 0;
      this.data.summary.totalUnmatched = 0;
      this.data.summary.totalRegexChecks = 0;
    } else {
      // First time initialization
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
  }

  /**
   * Add a matched key
   * @param {string} path - Path of the key
   */
  addMatchedKey(path) {
    this.data.matched.keys.push(path);
    this.updateSummary();
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
    this.updateSummary();
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
    this.updateSummary();
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
    this.updateSummary();
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
    this.updateSummary();
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
    const totalMatched = this.data.matched.keys.length;
    
    // If strictTypes is false, don't count type mismatches as unmatched items
    const strictTypes = this.options.strictTypes !== undefined ? this.options.strictTypes : true;
    const unmatchedTypesCount = strictTypes ? this.data.unmatched.types.length : 0;
    
    const totalUnmatched = this.data.unmatched.keys.length + 
                          this.data.unmatched.values.length + 
                          unmatchedTypesCount;
                          
    const totalKeysCompared = totalMatched + totalUnmatched;
    const totalRegexChecks = this.data.regexChecks.passed.length + this.data.regexChecks.failed.length;

    this.data.summary = {
      matchPercentage: totalKeysCompared > 0 ? (totalMatched / totalKeysCompared) * 100 : 100,
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

// Expose ResultPool for testing
Result.ResultPool = ResultPool;

module.exports = Result;