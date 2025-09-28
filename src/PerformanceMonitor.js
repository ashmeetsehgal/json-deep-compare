/**
 * @fileoverview Performance monitoring utilities for JSONCompare
 * @author AshmeetSehgal.com
 * @description Optional performance tracking and memory monitoring for development and optimization
 */

/**
 * Performance monitoring class for tracking comparison performance
 * @private
 */
class PerformanceMonitor {
  static enabled = false;
  static stats = {
    totalComparisons: 0,
    totalTime: 0,
    averageTime: 0,
    minTime: Infinity,
    maxTime: 0,
    memoryUsage: {
      heapUsed: 0,
      heapTotal: 0,
      external: 0
    },
    comparatorStats: {
      boolean: { count: 0, totalTime: 0 },
      ultraFast: { count: 0, totalTime: 0 },
      fast: { count: 0, totalTime: 0 },
      full: { count: 0, totalTime: 0 }
    },
    poolStats: {
      resultPoolHits: 0,
      resultPoolMisses: 0,
      regexCacheHits: 0,
      regexCacheMisses: 0
    }
  };

  /**
   * Enable performance monitoring
   * @param {Object} [options={}] - Monitoring options
   * @param {boolean} [options.trackMemory=true] - Whether to track memory usage
   * @param {boolean} [options.trackPools=true] - Whether to track pool statistics
   */
  static enable(options = {}) {
    this.enabled = true;
    this.options = {
      trackMemory: options.trackMemory !== false,
      trackPools: options.trackPools !== false,
      ...options
    };
    this.reset();
  }

  /**
   * Disable performance monitoring
   */
  static disable() {
    this.enabled = false;
  }

  /**
   * Reset all statistics
   */
  static reset() {
    this.stats = {
      totalComparisons: 0,
      totalTime: 0,
      averageTime: 0,
      minTime: Infinity,
      maxTime: 0,
      memoryUsage: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0
      },
      comparatorStats: {
        boolean: { count: 0, totalTime: 0 },
        ultraFast: { count: 0, totalTime: 0 },
        fast: { count: 0, totalTime: 0 },
        full: { count: 0, totalTime: 0 }
      },
      poolStats: {
        resultPoolHits: 0,
        resultPoolMisses: 0,
        regexCacheHits: 0,
        regexCacheMisses: 0
      }
    };
  }

  /**
   * Track a comparison operation
   * @param {string} comparatorType - Type of comparator used
   * @param {Function} fn - Function to track
   * @returns {*} Result of the function
   */
  static track(comparatorType, fn) {
    if (!this.enabled) {
      return fn();
    }

    const startTime = this._getHighResTime();
    const startMemory = this.options.trackMemory ? this._getMemoryUsage() : null;

    try {
      const result = fn();
      
      const endTime = this._getHighResTime();
      const duration = endTime - startTime;
      
      this._recordComparison(comparatorType, duration);
      
      if (this.options.trackMemory && startMemory) {
        const endMemory = this._getMemoryUsage();
        this._recordMemoryDelta(startMemory, endMemory);
      }
      
      return result;
    } catch (error) {
      // Record failed comparison
      const endTime = this._getHighResTime();
      const duration = endTime - startTime;
      this._recordComparison(comparatorType, duration);
      throw error;
    }
  }

  /**
   * Record a pool hit
   * @param {string} poolType - Type of pool (result, regex, etc.)
   */
  static recordPoolHit(poolType) {
    if (!this.enabled || !this.options.trackPools) return;
    
    const key = `${poolType}PoolHits`;
    if (this.stats.poolStats[key] !== undefined) {
      this.stats.poolStats[key]++;
    }
  }

  /**
   * Record a pool miss
   * @param {string} poolType - Type of pool (result, regex, etc.)
   */
  static recordPoolMiss(poolType) {
    if (!this.enabled || !this.options.trackPools) return;
    
    const key = `${poolType}PoolMisses`;
    if (this.stats.poolStats[key] !== undefined) {
      this.stats.poolStats[key]++;
    }
  }

  /**
   * Get current performance statistics
   * @returns {Object} Performance statistics
   */
  static getStats() {
    const stats = { ...this.stats };
    
    // Calculate derived statistics
    if (stats.totalComparisons > 0) {
      stats.averageTime = stats.totalTime / stats.totalComparisons;
      
      // Calculate comparator averages
      for (const [, typeStats] of Object.entries(stats.comparatorStats)) {
        if (typeStats.count > 0) {
          typeStats.averageTime = typeStats.totalTime / typeStats.count;
        }
      }
      
      // Calculate pool hit ratios
      const resultTotal = stats.poolStats.resultPoolHits + stats.poolStats.resultPoolMisses;
      const regexTotal = stats.poolStats.regexCacheHits + stats.poolStats.regexCacheMisses;
      
      stats.poolStats.resultPoolHitRatio = resultTotal > 0 ? stats.poolStats.resultPoolHits / resultTotal : 0;
      stats.poolStats.regexCacheHitRatio = regexTotal > 0 ? stats.poolStats.regexCacheHits / regexTotal : 0;
    }
    
    return stats;
  }

  /**
   * Get a performance summary report
   * @returns {string} Human-readable performance report
   */
  static getReport() {
    const stats = this.getStats();
    
    let report = '📊 JSONCompare Performance Report\n';
    report += '=' .repeat(40) + '\n\n';
    
    report += `📈 Overall Statistics:\n`;
    report += `  Total Comparisons: ${stats.totalComparisons}\n`;
    report += `  Total Time: ${stats.totalTime.toFixed(3)}ms\n`;
    report += `  Average Time: ${stats.averageTime.toFixed(3)}ms\n`;
    report += `  Min Time: ${stats.minTime === Infinity ? 'N/A' : stats.minTime.toFixed(3) + 'ms'}\n`;
    report += `  Max Time: ${stats.maxTime.toFixed(3)}ms\n\n`;
    
    report += `🚀 Comparator Performance:\n`;
    for (const [type, typeStats] of Object.entries(stats.comparatorStats)) {
      if (typeStats.count > 0) {
        report += `  ${type}: ${typeStats.count} calls, avg ${typeStats.averageTime.toFixed(3)}ms\n`;
      }
    }
    report += '\n';
    
    if (this.options.trackPools) {
      report += `🏊 Pool Statistics:\n`;
      report += `  Result Pool Hit Ratio: ${(stats.poolStats.resultPoolHitRatio * 100).toFixed(1)}%\n`;
      report += `  Regex Cache Hit Ratio: ${(stats.poolStats.regexCacheHitRatio * 100).toFixed(1)}%\n\n`;
    }
    
    if (this.options.trackMemory) {
      report += `💾 Memory Usage:\n`;
      report += `  Heap Used: ${(stats.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB\n`;
      report += `  Heap Total: ${(stats.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB\n`;
      report += `  External: ${(stats.memoryUsage.external / 1024 / 1024).toFixed(2)}MB\n`;
    }
    
    return report;
  }

  /**
   * Get high-resolution time
   * @returns {number} Time in milliseconds
   * @private
   */
  static _getHighResTime() {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now();
    } else if (typeof process !== 'undefined' && process.hrtime) {
      const hrTime = process.hrtime();
      return hrTime[0] * 1000 + hrTime[1] / 1000000;
    } else {
      return Date.now();
    }
  }

  /**
   * Get current memory usage
   * @returns {Object} Memory usage statistics
   * @private
   */
  static _getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage();
    }
    return { heapUsed: 0, heapTotal: 0, external: 0 };
  }

  /**
   * Record a comparison operation
   * @param {string} comparatorType - Type of comparator
   * @param {number} duration - Duration in milliseconds
   * @private
   */
  static _recordComparison(comparatorType, duration) {
    this.stats.totalComparisons++;
    this.stats.totalTime += duration;
    this.stats.minTime = Math.min(this.stats.minTime, duration);
    this.stats.maxTime = Math.max(this.stats.maxTime, duration);
    
    if (this.stats.comparatorStats[comparatorType]) {
      this.stats.comparatorStats[comparatorType].count++;
      this.stats.comparatorStats[comparatorType].totalTime += duration;
    }
  }

  /**
   * Record memory usage delta
   * @param {Object} startMemory - Memory usage at start
   * @param {Object} endMemory - Memory usage at end
   * @private
   */
  static _recordMemoryDelta(startMemory, endMemory) {
    this.stats.memoryUsage.heapUsed = endMemory.heapUsed;
    this.stats.memoryUsage.heapTotal = endMemory.heapTotal;
    this.stats.memoryUsage.external = endMemory.external;
  }
}

module.exports = PerformanceMonitor;
