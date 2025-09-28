/**
 * @fileoverview Adaptive comparator that selects optimal comparison mode
 * @author AshmeetSehgal.com
 * @description Intelligent comparison routing based on object characteristics
 */

const SmartModeSelector = require('./SmartModeSelector');
const UltraFastComparator = require('./UltraFastComparator');
const FastComparator = require('./FastComparator');
const Comparator = require('./Comparator');
const Result = require('./Result');
const RegexValidator = require('./RegexValidator');
const PerformanceMonitor = require('./PerformanceMonitor');

/**
 * Adaptive comparator that intelligently selects the optimal comparison mode
 */
class AdaptiveComparator {
  /**
   * Perform adaptive comparison with optimal mode selection
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @param {Object} options - Comparison options
   * @returns {Object} Comparison result
   */
  static compare(obj1, obj2, options) {
    // Select optimal mode based on object characteristics and options
    const mode = SmartModeSelector.selectMode(options, obj1, obj2);
    
    // Route to appropriate comparator with performance tracking
    return PerformanceMonitor.track(mode, () => {
      return this.routeToComparator(mode, obj1, obj2, options);
    });
  }

  /**
   * Route comparison to the appropriate comparator
   * @param {string} mode - Selected mode
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @param {Object} options - Comparison options
   * @returns {Object} Comparison result
   */
  static routeToComparator(mode, obj1, obj2, options) {
    switch (mode) {
      case 'ultraFast':
        return this.ultraFastCompare(obj1, obj2);
      
      case 'fast':
        return this.fastCompare(obj1, obj2, options);
      
      case 'full':
        return this.fullCompare(obj1, obj2, options);
      
      default:
        // Fallback to full comparison
        return this.fullCompare(obj1, obj2, options);
    }
  }

  /**
   * Ultra-fast comparison for identical or simple objects
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {Object} Comparison result
   */
  static ultraFastCompare(obj1, obj2) {
    return UltraFastComparator.ultraFastCompareWithResult(obj1, obj2);
  }

  /**
   * Fast comparison for simple objects without advanced features
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {Object} Comparison result
   */
  static fastCompare(obj1, obj2) {
    const fastResult = FastComparator.fastCompare(obj1, obj2);
    
    // Convert fast result to full result format for consistency
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

  /**
   * Full comparison for complex objects or advanced features
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @param {Object} options - Comparison options
   * @returns {Object} Comparison result
   */
  static fullCompare(obj1, obj2, options) {
    // Use direct instantiation for stability, with other memory optimizations
    const safeOptions = options || {};
    const result = new Result(safeOptions);
    const regexValidator = new RegexValidator(safeOptions, result);
    const comparator = new Comparator(safeOptions, result, regexValidator);
    
    comparator.compareObjects(obj1, obj2, '');
    result.updateSummary();
    return result.getResult();
  }

  /**
   * Get mode selection statistics for debugging
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @param {Object} options - Comparison options
   * @returns {Object} Selection statistics
   */
  static getSelectionStats(obj1, obj2, options) {
    return SmartModeSelector.getSelectionStats(options, obj1, obj2);
  }

  /**
   * Force a specific comparison mode (for testing or special cases)
   * @param {string} mode - Mode to force
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @param {Object} options - Comparison options
   * @returns {Object} Comparison result
   */
  static forceMode(mode, obj1, obj2, options) {
    return PerformanceMonitor.track(mode, () => {
      return this.routeToComparator(mode, obj1, obj2, options);
    });
  }

  /**
   * Compare with mode selection debugging
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @param {Object} options - Comparison options
   * @returns {Object} Comparison result with selection info
   */
  static compareWithDebug(obj1, obj2, options) {
    const stats = this.getSelectionStats(obj1, obj2, options);
    const result = this.compare(obj1, obj2, options);
    
    return {
      ...result,
      _debug: {
        modeSelection: stats,
        performance: PerformanceMonitor.getStats()
      }
    };
  }
}

module.exports = AdaptiveComparator;
