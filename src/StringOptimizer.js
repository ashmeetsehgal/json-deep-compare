/**
 * @fileoverview String optimization utilities for JSONCompare
 * @author AshmeetSehgal.com
 * @description String interning, caching, and optimization for memory efficiency
 */

/**
 * String optimization class for memory efficiency
 * @private
 */
class StringOptimizer {
  static internedStrings = new Map();
  static pathCache = new Map();
  static maxCacheSize = 1000;
  static cacheHits = 0;
  static cacheMisses = 0;

  /**
   * Intern a string to reduce memory usage for repeated strings
   * @param {string} str - String to intern
   * @returns {string} Interned string
   */
  static intern(str) {
    if (typeof str !== 'string') return str;
    if (str.length === 0) return '';
    
    // Check cache first
    if (this.internedStrings.has(str)) {
      this.cacheHits++;
      return this.internedStrings.get(str);
    }
    
    // Add to cache if not too large
    if (this.internedStrings.size < this.maxCacheSize) {
      this.internedStrings.set(str, str);
      this.cacheMisses++;
    }
    
    return str;
  }

  /**
   * Build path with caching for common patterns
   * @param {string} basePath - Base path
   * @param {string} key - Key to append
   * @returns {string} Built path
   */
  static buildPath(basePath, key) {
    if (!basePath) return this.intern(key);
    if (!key) return this.intern(basePath);
    
    const pathKey = `${basePath}.${key}`;
    
    // Check cache first
    if (this.pathCache.has(pathKey)) {
      this.cacheHits++;
      return this.pathCache.get(pathKey);
    }
    
    // Build path efficiently
    let result;
    if (basePath.length > 50) {
      // Use array join for long paths
      result = [basePath, key].join('.');
    } else {
      // Use template literal for short paths
      result = `${basePath}.${key}`;
    }
    
    // Cache the result
    const internedResult = this.intern(result);
    if (this.pathCache.size < this.maxCacheSize) {
      this.pathCache.set(pathKey, internedResult);
    }
    
    this.cacheMisses++;
    return internedResult;
  }

  /**
   * Build array path with caching
   * @param {string} basePath - Base path
   * @param {number} index - Array index
   * @returns {string} Built array path
   */
  static buildArrayPath(basePath, index) {
    const pathKey = `${basePath}[${index}]`;
    
    // Check cache first
    if (this.pathCache.has(pathKey)) {
      this.cacheHits++;
      return this.pathCache.get(pathKey);
    }
    
    // Build path efficiently
    let result;
    if (index < 10) {
      // Use concatenation for small indices
      result = basePath + '[' + index + ']';
    } else {
      // Use template literal for larger indices
      result = `${basePath}[${index}]`;
    }
    
    // Cache the result
    const internedResult = this.intern(result);
    if (this.pathCache.size < this.maxCacheSize) {
      this.pathCache.set(pathKey, internedResult);
    }
    
    this.cacheMisses++;
    return internedResult;
  }

  /**
   * Optimize string array by interning all strings
   * @param {string[]} strings - Array of strings to optimize
   * @returns {string[]} Optimized array with interned strings
   */
  static optimizeStringArray(strings) {
    if (!Array.isArray(strings)) return strings;
    
    return strings.map(str => this.intern(str));
  }

  /**
   * Clear all caches (useful for testing or memory management)
   */
  static clearCaches() {
    this.internedStrings.clear();
    this.pathCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  static getCacheStats() {
    const totalRequests = this.cacheHits + this.cacheMisses;
    return {
      internedStrings: this.internedStrings.size,
      pathCache: this.pathCache.size,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      hitRatio: totalRequests > 0 ? this.cacheHits / totalRequests : 0,
      maxCacheSize: this.maxCacheSize
    };
  }

  /**
   * Optimize object paths by interning common patterns
   * @param {Object} obj - Object with path properties
   * @returns {Object} Optimized object with interned paths
   */
  static optimizePaths(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const optimized = {};
    for (const [key, value] of Object.entries(obj)) {
      const internedKey = this.intern(key);
      if (typeof value === 'string') {
        optimized[internedKey] = this.intern(value);
      } else if (Array.isArray(value)) {
        optimized[internedKey] = this.optimizeStringArray(value);
      } else if (typeof value === 'object' && value !== null) {
        optimized[internedKey] = this.optimizePaths(value);
      } else {
        optimized[internedKey] = value;
      }
    }
    
    return optimized;
  }

  /**
   * Batch intern multiple strings for efficiency
   * @param {string[]} strings - Array of strings to intern
   * @returns {string[]} Array of interned strings
   */
  static batchIntern(strings) {
    if (!Array.isArray(strings)) return strings;
    
    return strings.map(str => this.intern(str));
  }

  /**
   * Get memory usage estimate for string optimization
   * @returns {Object} Memory usage estimate
   */
  static getMemoryUsage() {
    let totalSize = 0;
    
    // Estimate interned strings memory
    for (const str of this.internedStrings.values()) {
      totalSize += str.length * 2; // Rough estimate for string memory
    }
    
    // Estimate path cache memory
    for (const [key, value] of this.pathCache.entries()) {
      totalSize += (key.length + value.length) * 2;
    }
    
    return {
      estimatedBytes: totalSize,
      estimatedKB: Math.round(totalSize / 1024 * 100) / 100,
      internedStrings: this.internedStrings.size,
      pathCache: this.pathCache.size
    };
  }
}

module.exports = StringOptimizer;
