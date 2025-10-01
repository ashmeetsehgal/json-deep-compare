/**
 * @fileoverview Common cache statistics utilities to reduce duplication
 * @author AshmeetSehgal.com
 * @description Shared cache statistics tracking across different cache implementations
 */

/**
 * Common cache statistics utilities to reduce duplication
 * @private
 */
class CacheStatistics {
  /**
   * Initialize cache statistics
   * @param {Object} target - Object to add statistics to
   * @param {string} [prefix=''] - Prefix for statistic names
   */
  static initialize(target, prefix = '') {
    const hits = prefix + 'cacheHits';
    const misses = prefix + 'cacheMisses';
    const evictions = prefix + 'cacheEvictions';
    
    target[hits] = 0;
    target[misses] = 0;
    target[evictions] = 0;
  }

  /**
   * Record a cache hit
   * @param {Object} target - Object with statistics
   * @param {string} [prefix=''] - Prefix for statistic names
   */
  static recordHit(target, prefix = '') {
    target[prefix + 'cacheHits']++;
  }

  /**
   * Record a cache miss
   * @param {Object} target - Object with statistics
   * @param {string} [prefix=''] - Prefix for statistic names
   */
  static recordMiss(target, prefix = '') {
    target[prefix + 'cacheMisses']++;
  }

  /**
   * Record a cache eviction
   * @param {Object} target - Object with statistics
   * @param {string} [prefix=''] - Prefix for statistic names
   */
  static recordEviction(target, prefix = '') {
    target[prefix + 'cacheEvictions']++;
  }

  /**
   * Get cache statistics
   * @param {Object} target - Object with statistics
   * @param {string} [prefix=''] - Prefix for statistic names
   * @returns {Object} Cache statistics
   */
  static getStats(target, prefix = '') {
    const hits = target[prefix + 'cacheHits'] || 0;
    const misses = target[prefix + 'cacheMisses'] || 0;
    const evictions = target[prefix + 'cacheEvictions'] || 0;
    const totalRequests = hits + misses;
    
    return {
      cacheHits: hits,
      cacheMisses: misses,
      cacheEvictions: evictions,
      hitRatio: totalRequests > 0 ? hits / totalRequests : 0,
      totalRequests
    };
  }

  /**
   * Reset cache statistics
   * @param {Object} target - Object with statistics
   * @param {string} [prefix=''] - Prefix for statistic names
   */
  static reset(target, prefix = '') {
    target[prefix + 'cacheHits'] = 0;
    target[prefix + 'cacheMisses'] = 0;
    target[prefix + 'cacheEvictions'] = 0;
  }

  /**
   * Create a standardized cache statistics object
   * @param {Object} stats - Individual cache statistics
   * @returns {Object} Standardized statistics object
   */
  static createStandardStats(stats) {
    const totalRequests = stats.cacheHits + stats.cacheMisses;
    return {
      ...stats,
      hitRatio: totalRequests > 0 ? stats.cacheHits / totalRequests : 0,
      totalRequests
    };
  }
}

module.exports = CacheStatistics;
