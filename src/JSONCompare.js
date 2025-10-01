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
// const UltraFastComparator = require('./UltraFastComparator'); // Now handled by AdaptiveComparator
const BooleanComparator = require('./BooleanComparator');
const PerformanceMonitor = require('./PerformanceMonitor');
const AdaptiveComparator = require('./AdaptiveComparator');

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
    this.useFastMode = FastComparator.shouldUseFastMode(this.options);
    this.useUltraFastMode = this.shouldUseUltraFastMode();
    
    // Always create these for backward compatibility, even if we use pooled objects
    // The pooled versions will override these when needed
    this.result = new Result(this.options);
    this.regexValidator = new RegexValidator(this.options, this.result);
    this.comparator = new Comparator(this.options, this.result, this.regexValidator);
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
   * Compare two JSON objects with intelligent mode selection
   * @param {Object} obj1 - First JSON object
   * @param {Object} obj2 - Second JSON object
   * @returns {Object} Comparison result
   */
  compare(obj1, obj2) {
    // Use adaptive comparator for intelligent mode selection
    return AdaptiveComparator.compare(obj1, obj2, this.options);
  }

  /**
   * Pure boolean comparison - fastest possible
   * @param {Object} obj1 - First JSON object
   * @param {Object} obj2 - Second JSON object
   * @returns {boolean} Comparison result
   */
  isEqual(obj1, obj2) {
    return PerformanceMonitor.track('boolean', () => {
      return BooleanComparator.booleanCompare(obj1, obj2);
    });
  }

  /**
   * Enhance the comparison with additional regex checks
   * @param {Object} obj1 - First object (used for comparison)
   * @param {Object} obj2 - Second object (used for regex validation)
   * @returns {Object} Enhanced result with all regex checks
   */
  compareAndValidate(obj1, obj2) {
    // For validation, we need full mode to support regex checks
    // But we can still use adaptive selection for the base comparison
    const baseResult = AdaptiveComparator.compare(obj1, obj2, this.options);
    
    // If we used a fast mode, we need to add regex validation
    if (baseResult.summary.totalRegexChecks === 0 && this.options.regexChecks) {
      // Fall back to full mode for regex validation
      this.result.reset();
      this.comparator.compareObjects(obj1, obj2, '');
      this.regexValidator.validateAllMatchingKeys(obj2);
      this.result.updateSummary();
      return this.result.getResult();
    }
    
    return baseResult;
  }

  /**
   * Enable performance monitoring for all JSONCompare instances
   * @param {Object} [options={}] - Monitoring options
   * @static
   */
  static enablePerformanceMonitoring(options = {}) {
    PerformanceMonitor.enable(options);
  }

  /**
   * Disable performance monitoring
   * @static
   */
  static disablePerformanceMonitoring() {
    PerformanceMonitor.disable();
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance statistics
   * @static
   */
  static getPerformanceStats() {
    return PerformanceMonitor.getStats();
  }

  /**
   * Get performance report
   * @returns {string} Human-readable performance report
   * @static
   */
  static getPerformanceReport() {
    return PerformanceMonitor.getReport();
  }

  /**
   * Reset performance statistics
   * @static
   */
  static resetPerformanceStats() {
    PerformanceMonitor.reset();
  }

  /**
   * Get mode selection statistics for debugging
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {Object} Mode selection statistics
   */
  getModeSelectionStats(obj1, obj2) {
    return AdaptiveComparator.getSelectionStats(obj1, obj2, this.options);
  }

  /**
   * Compare with mode selection debugging
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {Object} Comparison result with selection info
   */
  compareWithDebug(obj1, obj2) {
    return AdaptiveComparator.compareWithDebug(obj1, obj2, this.options);
  }

  /**
   * Force a specific comparison mode (for testing)
   * @param {string} mode - Mode to force ('ultraFast', 'fast', 'full')
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {Object} Comparison result
   */
  forceMode(mode, obj1, obj2) {
    return AdaptiveComparator.forceMode(mode, obj1, obj2, this.options);
  }
}

module.exports = JSONCompare;