/**
 * @fileoverview Advanced caching system for JSONCompare
 * @author AshmeetSehgal.com
 * @description Intelligent caching for type detection, regex patterns, and comparison results
 */

const crypto = require('node:crypto');
const util = require('node:util');

/**
 * Advanced caching system for performance optimization
 * @private
 */
class AdvancedCache {
  static typeCache = new WeakMap();
  static regexCache = new Map();
  static resultCache = new Map();
  static pathCache = new Map();
  
  static maxCacheSize = 1000;
  static cacheHits = 0;
  static cacheMisses = 0;
  static cacheEvictions = 0;

  /**
   * Get cached type for an object
   * @param {*} obj - Object to get type for
   * @returns {string|null} Cached type or null if not cached
   */
  static getCachedType(obj) {
    if (this.typeCache.has(obj)) {
      this.cacheHits++;
      return this.typeCache.get(obj);
    }
    this.cacheMisses++;
    return null;
  }

  /**
   * Cache type for an object
   * @param {*} obj - Object to cache type for
   * @param {string} type - Type to cache
   */
  static cacheType(obj, type) {
    this.typeCache.set(obj, type);
  }

  /**
   * Get cached regex pattern
   * @param {string|RegExp} pattern - Pattern to get
   * @returns {RegExp|null} Cached regex or null if not cached
   */
  static getCachedRegex(pattern) {
    const key = pattern.toString();
    if (this.regexCache.has(key)) {
      this.cacheHits++;
      return this.regexCache.get(key);
    }
    this.cacheMisses++;
    return null;
  }

  /**
   * Cache regex pattern
   * @param {string|RegExp} pattern - Pattern to cache
   * @param {RegExp} compiled - Compiled regex
   */
  static cacheRegex(pattern, compiled) {
    const key = pattern.toString();
    if (this.regexCache.size >= this.maxCacheSize) {
      this.evictOldestRegex();
    }
    this.regexCache.set(key, compiled);
  }

  /**
   * Get cached comparison result
   * @param {string} key - Cache key
   * @returns {Object|null} Cached result or null if not cached
   */
  static getCachedResult(key) {
    if (this.resultCache.has(key)) {
      this.cacheHits++;
      return this.resultCache.get(key);
    }
    this.cacheMisses++;
    return null;
  }

  /**
   * Cache comparison result
   * @param {string} key - Cache key
   * @param {Object} result - Result to cache
   */
  static cacheResult(key, result) {
    if (this.resultCache.size >= this.maxCacheSize) {
      this.evictOldestResult();
    }
    this.resultCache.set(key, result);
  }

  /**
   * Get cached path
   * @param {string} key - Path key
   * @returns {string|null} Cached path or null if not cached
   */
  static getCachedPath(key) {
    if (this.pathCache.has(key)) {
      this.cacheHits++;
      return this.pathCache.get(key);
    }
    this.cacheMisses++;
    return null;
  }

  /**
   * Cache path
   * @param {string} key - Path key
   * @param {string} path - Path to cache
   */
  static cachePath(key, path) {
    if (this.pathCache.size >= this.maxCacheSize) {
      this.evictOldestPath();
    }
    this.pathCache.set(key, path);
  }

  /**
   * Generate cache key for comparison
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @param {Object} options - Comparison options
   * @returns {string} Cache key
   */
  static generateCacheKey(obj1, obj2, options) {
    // Generate stable, collision-resistant hashes
    const obj1Hash = this.hashObject(obj1);
    const obj2Hash = this.hashObject(obj2);
    const optionsHash = this.hashObject(options);
    
    // Combine the three hashes and hash the result for maximum collision resistance
    const combined = `${obj1Hash}|${obj2Hash}|${optionsHash}`;
    return crypto.createHash('sha256').update(combined).digest('hex');
  }

  /**
   * Robust serializer for hash input that handles type metadata, circular refs, and non-JSON values
   * @param {*} obj - Object to serialize
   * @param {Set} seen - Set to track circular references
   * @returns {string} Serialized representation
   */
  static serializeForHash(obj, seen = new Set()) {
    // Handle primitive types with explicit type markers
    if (obj === null) return '[null]';
    if (obj === undefined) return '[undefined]';
    if (typeof obj === 'boolean') return `[boolean:${obj}]`;
    if (typeof obj === 'number') return `[number:${obj}]`;
    if (typeof obj === 'string') return `[string:${obj}]`;
    if (typeof obj === 'symbol') return `[symbol:${obj.toString()}]`;
    if (typeof obj === 'function') {
      try {
        return `[function:${obj.name || 'anonymous'}:${obj.toString()}]`;
      } catch (error) {
        // Fallback to name-only format if toString() fails
        return `[function:${obj.name || 'anonymous'}]`;
      }
    }
    if (typeof obj === 'bigint') return `[bigint:${obj.toString()}]`;
    
    // Handle objects
    if (typeof obj === 'object') {
      // Check for circular references
      if (seen.has(obj)) {
        return '[circular]';
      }
      seen.add(obj);
      
      try {
        // Handle arrays
        if (Array.isArray(obj)) {
          const items = obj.map(item => this.serializeForHash(item, seen));
          return `[array:${items.join(',')}]`;
        }
        
        // Handle Date objects
        if (obj instanceof Date) {
          return `[date:${obj.toISOString()}]`;
        }
        
        // Handle RegExp objects
        if (obj instanceof RegExp) {
          return `[regexp:${obj.toString()}]`;
        }
        
        // Handle Error objects
        if (obj instanceof Error) {
          return `[error:${obj.name}:${obj.message}]`;
        }
        
        // Handle plain objects
        const keys = Object.keys(obj).sort(); // Deterministic key ordering
        const pairs = keys.map(key => {
          const value = this.serializeForHash(obj[key], seen);
          return `${key}:${value}`;
        });
        return `[object:${pairs.join(',')}]`;
        
      } catch (e) {
        // Fallback for objects that can't be serialized
        return `[object:${util.inspect(obj, { depth: null, maxArrayLength: null })}]`;
      } finally {
        seen.delete(obj);
      }
    }
    
    // Fallback for any other types
    return `[unknown:${util.inspect(obj, { depth: null })}]`;
  }

  /**
   * Generate stable, collision-resistant hash for objects using SHA256
   * @param {*} obj - Object to hash
   * @returns {string} SHA256 hash string
   */
  static hashObject(obj) {
    const serialized = this.serializeForHash(obj);
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  /**
   * Evict oldest regex from cache
   */
  static evictOldestRegex() {
    const firstKey = this.regexCache.keys().next().value;
    if (firstKey) {
      this.regexCache.delete(firstKey);
      this.cacheEvictions++;
    }
  }

  /**
   * Evict oldest result from cache
   */
  static evictOldestResult() {
    const firstKey = this.resultCache.keys().next().value;
    if (firstKey) {
      this.resultCache.delete(firstKey);
      this.cacheEvictions++;
    }
  }

  /**
   * Evict oldest path from cache
   */
  static evictOldestPath() {
    const firstKey = this.pathCache.keys().next().value;
    if (firstKey) {
      this.pathCache.delete(firstKey);
      this.cacheEvictions++;
    }
  }

  /**
   * Clear all caches
   */
  static clearAllCaches() {
    this.typeCache = new WeakMap();
    this.regexCache.clear();
    this.resultCache.clear();
    this.pathCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.cacheEvictions = 0;
  }

  /**
   * Get comprehensive cache statistics
   * @returns {Object} Cache statistics
   */
  static getCacheStats() {
    const totalRequests = this.cacheHits + this.cacheMisses;
    return {
      typeCache: this.typeCache.size || 'WeakMap (size unknown)',
      regexCache: this.regexCache.size,
      resultCache: this.resultCache.size,
      pathCache: this.pathCache.size,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      cacheEvictions: this.cacheEvictions,
      hitRatio: totalRequests > 0 ? this.cacheHits / totalRequests : 0,
      maxCacheSize: this.maxCacheSize
    };
  }

  /**
   * Optimize cache sizes based on usage patterns
   */
  static optimizeCacheSizes() {
    const stats = this.getCacheStats();
    
    // Adjust cache sizes based on hit ratios
    if (stats.hitRatio > 0.8) {
      this.maxCacheSize = Math.min(2000, this.maxCacheSize * 1.5);
    } else if (stats.hitRatio < 0.3) {
      this.maxCacheSize = Math.max(500, this.maxCacheSize * 0.8);
    }
  }

  /**
   * Preload common patterns into cache
   * @param {Array} patterns - Common patterns to preload
   */
  static preloadPatterns(patterns) {
    patterns.forEach(pattern => {
      if (typeof pattern === 'string' || pattern instanceof RegExp) {
        const compiled = new RegExp(pattern);
        this.cacheRegex(pattern, compiled);
      }
    });
  }

  /**
   * Get memory usage estimate for all caches
   * @returns {Object} Memory usage estimate
   */
  static getMemoryUsage() {
    let totalSize = 0;
    
    // Estimate regex cache memory
    for (const [key] of this.regexCache.entries()) {
      totalSize += key.length * 2 + 100; // Rough estimate
    }
    
    // Estimate result cache memory
    for (const [key, value] of this.resultCache.entries()) {
      totalSize += key.length * 2 + JSON.stringify(value).length * 2;
    }
    
    // Estimate path cache memory
    for (const [key, value] of this.pathCache.entries()) {
      totalSize += (key.length + value.length) * 2;
    }
    
    return {
      estimatedBytes: totalSize,
      estimatedKB: Math.round(totalSize / 1024 * 100) / 100,
      regexCache: this.regexCache.size,
      resultCache: this.resultCache.size,
      pathCache: this.pathCache.size
    };
  }
}

module.exports = AdvancedCache;
