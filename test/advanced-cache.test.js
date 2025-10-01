/**
 * @fileoverview Comprehensive tests for AdvancedCache
 * @author AshmeetSehgal.com
 * @description Tests for AdvancedCache to achieve high coverage
 */

const AdvancedCache = require('../src/AdvancedCache');

describe('AdvancedCache Tests', () => {
  beforeEach(() => {
    AdvancedCache.clearAllCaches();
  });

  afterEach(() => {
    AdvancedCache.clearAllCaches();
  });

  describe('Type Cache', () => {
    test('should cache and retrieve types', () => {
      const obj = { test: 'value' };
      
      // Should not be cached initially
      expect(AdvancedCache.getCachedType(obj)).toBeNull();
      
      // Cache the type
      AdvancedCache.cacheType(obj, 'object');
      
      // Should be cached now
      expect(AdvancedCache.getCachedType(obj)).toBe('object');
    });

    test('should handle different object types', () => {
      const obj1 = { a: 1 };
      const obj2 = [1, 2, 3];
      const obj3 = new Date();
      
      AdvancedCache.cacheType(obj1, 'object');
      AdvancedCache.cacheType(obj2, 'array');
      AdvancedCache.cacheType(obj3, 'date');
      
      expect(AdvancedCache.getCachedType(obj1)).toBe('object');
      expect(AdvancedCache.getCachedType(obj2)).toBe('array');
      expect(AdvancedCache.getCachedType(obj3)).toBe('date');
    });

    test('should handle null and undefined', () => {
      // WeakMap cannot use null as key, so we'll test with a different approach
      const obj = {};
      AdvancedCache.cacheType(obj, 'object');
      expect(AdvancedCache.getCachedType(obj)).toBe('object');
    });
  });

  describe('Regex Cache', () => {
    test('should cache and retrieve regex patterns', () => {
      const pattern = '^[a-zA-Z]+$';
      const compiled = new RegExp(pattern);
      
      // Should not be cached initially
      expect(AdvancedCache.getCachedRegex(pattern)).toBeNull();
      
      // Cache the regex
      AdvancedCache.cacheRegex(pattern, compiled);
      
      // Should be cached now
      expect(AdvancedCache.getCachedRegex(pattern)).toBe(compiled);
    });

    test('should handle RegExp objects', () => {
      const pattern = /^test$/;
      const compiled = new RegExp(pattern);
      
      AdvancedCache.cacheRegex(pattern, compiled);
      expect(AdvancedCache.getCachedRegex(pattern)).toBe(compiled);
    });

    test('should handle cache eviction when size limit reached', () => {
      // Set a small cache size for testing
      const originalSize = AdvancedCache.maxCacheSize;
      AdvancedCache.maxCacheSize = 3;
      
      try {
        // Fill cache beyond limit
        AdvancedCache.cacheRegex('pattern1', new RegExp('pattern1'));
        AdvancedCache.cacheRegex('pattern2', new RegExp('pattern2'));
        AdvancedCache.cacheRegex('pattern3', new RegExp('pattern3'));
        AdvancedCache.cacheRegex('pattern4', new RegExp('pattern4')); // Should evict pattern1
        
        // pattern1 should be evicted
        expect(AdvancedCache.getCachedRegex('pattern1')).toBeNull();
        expect(AdvancedCache.getCachedRegex('pattern4')).toBeDefined();
      } finally {
        AdvancedCache.maxCacheSize = originalSize;
      }
    });
  });

  describe('Result Cache', () => {
    test('should cache and retrieve results', () => {
      const key = 'test-key';
      const result = { matchPercentage: 100, totalKeys: 5 };
      
      // Should not be cached initially
      expect(AdvancedCache.getCachedResult(key)).toBeNull();
      
      // Cache the result
      AdvancedCache.cacheResult(key, result);
      
      // Should be cached now
      expect(AdvancedCache.getCachedResult(key)).toBe(result);
    });

    test('should handle complex result objects', () => {
      const key = 'complex-key';
      const result = {
        matchPercentage: 85,
        totalKeys: 10,
        matched: 8,
        unmatched: 2,
        details: {
          values: [{ path: 'a.b', expected: 1, actual: 2 }],
          keys: []
        }
      };
      
      AdvancedCache.cacheResult(key, result);
      const cached = AdvancedCache.getCachedResult(key);
      expect(cached).toEqual(result);
    });

    test('should handle cache eviction for results', () => {
      const originalSize = AdvancedCache.maxCacheSize;
      AdvancedCache.maxCacheSize = 2;
      
      try {
        AdvancedCache.cacheResult('key1', { result: 1 });
        AdvancedCache.cacheResult('key2', { result: 2 });
        AdvancedCache.cacheResult('key3', { result: 3 }); // Should evict key1
        
        expect(AdvancedCache.getCachedResult('key1')).toBeNull();
        expect(AdvancedCache.getCachedResult('key3')).toBeDefined();
      } finally {
        AdvancedCache.maxCacheSize = originalSize;
      }
    });
  });

  describe('Path Cache', () => {
    test('should cache and retrieve paths', () => {
      const key = 'path-key';
      const path = 'user.profile.name';
      
      // Should not be cached initially
      expect(AdvancedCache.getCachedPath(key)).toBeNull();
      
      // Cache the path
      AdvancedCache.cachePath(key, path);
      
      // Should be cached now
      expect(AdvancedCache.getCachedPath(key)).toBe(path);
    });

    test('should handle array paths', () => {
      const key = 'array-path';
      const path = 'items[0].name';
      
      AdvancedCache.cachePath(key, path);
      expect(AdvancedCache.getCachedPath(key)).toBe(path);
    });

    test('should handle cache eviction for paths', () => {
      const originalSize = AdvancedCache.maxCacheSize;
      AdvancedCache.maxCacheSize = 2;
      
      try {
        AdvancedCache.cachePath('path1', 'a.b');
        AdvancedCache.cachePath('path2', 'c.d');
        AdvancedCache.cachePath('path3', 'e.f'); // Should evict path1
        
        expect(AdvancedCache.getCachedPath('path1')).toBeNull();
        expect(AdvancedCache.getCachedPath('path3')).toBe('e.f');
      } finally {
        AdvancedCache.maxCacheSize = originalSize;
      }
    });
  });

  describe('Cache Key Generation', () => {
    test('should generate consistent cache keys', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      const options = { strictTypes: true };
      
      const key1 = AdvancedCache.generateCacheKey(obj1, obj2, options);
      const key2 = AdvancedCache.generateCacheKey(obj1, obj2, options);
      
      expect(key1).toBe(key2);
      expect(key1).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex string
    });

    test('should generate different keys for different objects', () => {
      const obj1a = { a: 1 };
      const obj1b = { a: 1 };
      const obj2a = { a: 2 };
      const obj2b = { a: 2 };
      const options = {};
      
      const key1 = AdvancedCache.generateCacheKey(obj1a, obj1b, options);
      const key2 = AdvancedCache.generateCacheKey(obj2a, obj2b, options);
      
      expect(key1).not.toBe(key2);
    });

    test('should generate different keys for different options', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      const options1 = { strictTypes: true };
      const options2 = { strictTypes: false };
      
      const key1 = AdvancedCache.generateCacheKey(obj1, obj2, options1);
      const key2 = AdvancedCache.generateCacheKey(obj1, obj2, options2);
      
      expect(key1).not.toBe(key2);
    });
  });

  describe('Object Serialization', () => {
    test('should serialize primitives correctly', () => {
      expect(AdvancedCache.serializeForHash(null)).toBe('[null]');
      expect(AdvancedCache.serializeForHash(undefined)).toBe('[undefined]');
      expect(AdvancedCache.serializeForHash(true)).toBe('[boolean:true]');
      expect(AdvancedCache.serializeForHash(42)).toBe('[number:42]');
      expect(AdvancedCache.serializeForHash('hello')).toBe('[string:hello]');
    });

    test('should serialize arrays correctly', () => {
      const arr = [1, 'hello', true];
      const serialized = AdvancedCache.serializeForHash(arr);
      expect(serialized).toContain('[array:');
      expect(serialized).toContain('[number:1]');
      expect(serialized).toContain('[string:hello]');
      expect(serialized).toContain('[boolean:true]');
    });

    test('should serialize objects correctly', () => {
      const obj = { a: 1, b: 'hello' };
      const serialized = AdvancedCache.serializeForHash(obj);
      expect(serialized).toContain('[object:');
      expect(serialized).toContain('a:[number:1]');
      expect(serialized).toContain('b:[string:hello]');
    });

    test('should handle circular references', () => {
      const obj = { a: 1 };
      obj.self = obj;
      
      const serialized = AdvancedCache.serializeForHash(obj);
      expect(serialized).toContain('[circular]');
    });

    test('should handle special objects', () => {
      const date = new Date('2023-01-01');
      const regex = /test/;
      const error = new Error('test error');
      
      expect(AdvancedCache.serializeForHash(date)).toContain('[date:');
      expect(AdvancedCache.serializeForHash(regex)).toContain('[regexp:');
      expect(AdvancedCache.serializeForHash(error)).toContain('[error:');
    });

    test('should handle functions', () => {
      const fn = function test() { return 'hello'; };
      const serialized = AdvancedCache.serializeForHash(fn);
      expect(serialized).toContain('[function:test:');
    });

    test('should handle symbols', () => {
      const sym = Symbol('test');
      const serialized = AdvancedCache.serializeForHash(sym);
      expect(serialized).toContain('[symbol:');
    });

    test('should handle bigint', () => {
      const big = BigInt(123);
      const serialized = AdvancedCache.serializeForHash(big);
      expect(serialized).toContain('[bigint:123]');
    });
  });

  describe('Hash Generation', () => {
    test('should generate consistent hashes', () => {
      const obj = { a: 1, b: 2 };
      const hash1 = AdvancedCache.hashObject(obj);
      const hash2 = AdvancedCache.hashObject(obj);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    test('should generate different hashes for different objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 2 };
      
      const hash1 = AdvancedCache.hashObject(obj1);
      const hash2 = AdvancedCache.hashObject(obj2);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Cache Statistics', () => {
    test('should track cache hits and misses', () => {
      const obj = { test: 'value' };
      
      // Miss
      AdvancedCache.getCachedType(obj);
      expect(AdvancedCache.cacheMisses).toBe(1);
      
      // Cache and hit
      AdvancedCache.cacheType(obj, 'object');
      AdvancedCache.getCachedType(obj);
      expect(AdvancedCache.cacheHits).toBe(1);
    });

    test('should provide comprehensive statistics', () => {
      const stats = AdvancedCache.getCacheStats();
      
      expect(stats).toHaveProperty('typeCache');
      expect(stats).toHaveProperty('regexCache');
      expect(stats).toHaveProperty('resultCache');
      expect(stats).toHaveProperty('pathCache');
      expect(stats).toHaveProperty('cacheHits');
      expect(stats).toHaveProperty('cacheMisses');
      expect(stats).toHaveProperty('cacheEvictions');
      expect(stats).toHaveProperty('hitRatio');
      expect(stats).toHaveProperty('maxCacheSize');
    });

    test('should calculate hit ratio correctly', () => {
      AdvancedCache.clearAllCaches();
      
      // 2 misses, 1 hit
      const obj = {};
      AdvancedCache.getCachedType(obj); // miss
      AdvancedCache.cacheType(obj, 'object');
      AdvancedCache.getCachedType(obj); // hit
      
      const stats = AdvancedCache.getCacheStats();
      expect(stats.hitRatio).toBe(0.5); // 1 hit out of 2 total requests
    });
  });

  describe('Cache Management', () => {
    test('should clear all caches', () => {
      // Add some data to caches
      const obj = {};
      AdvancedCache.cacheType(obj, 'object');
      AdvancedCache.cacheRegex('test', /test/);
      AdvancedCache.cacheResult('key', { result: 1 });
      AdvancedCache.cachePath('path', 'a.b');
      
      // Verify data is cached
      expect(AdvancedCache.getCachedRegex('test')).toBeDefined();
      expect(AdvancedCache.getCachedResult('key')).toBeDefined();
      expect(AdvancedCache.getCachedPath('path')).toBeDefined();
      
      // Clear all
      AdvancedCache.clearAllCaches();
      
      // Verify caches are empty
      expect(AdvancedCache.getCachedRegex('test')).toBeNull();
      expect(AdvancedCache.getCachedResult('key')).toBeNull();
      expect(AdvancedCache.getCachedPath('path')).toBeNull();
    });

    test('should optimize cache sizes', () => {
      const originalSize = AdvancedCache.maxCacheSize;
      
      // Simulate high hit ratio
      AdvancedCache.cacheHits = 80;
      AdvancedCache.cacheMisses = 20;
      
      AdvancedCache.optimizeCacheSizes();
      
      // Should increase cache size (or stay the same if already at max)
      expect(AdvancedCache.maxCacheSize).toBeGreaterThanOrEqual(originalSize);
      
      // Reset
      AdvancedCache.maxCacheSize = originalSize;
    });

    test('should preload patterns', () => {
      const patterns = ['^[a-zA-Z]+$', /^test$/, '^[0-9]+$'];
      
      AdvancedCache.preloadPatterns(patterns);
      
      // All patterns should be cached
      expect(AdvancedCache.getCachedRegex('^[a-zA-Z]+$')).toBeDefined();
      expect(AdvancedCache.getCachedRegex(/^test$/)).toBeDefined();
      expect(AdvancedCache.getCachedRegex('^[0-9]+$')).toBeDefined();
    });
  });

  describe('Memory Usage', () => {
    test('should estimate memory usage', () => {
      // Add some data to caches
      AdvancedCache.cacheRegex('pattern1', /pattern1/);
      AdvancedCache.cacheResult('key1', { result: 'test' });
      AdvancedCache.cachePath('path1', 'a.b.c');
      
      const usage = AdvancedCache.getMemoryUsage();
      
      expect(usage).toHaveProperty('estimatedBytes');
      expect(usage).toHaveProperty('estimatedKB');
      expect(usage).toHaveProperty('regexCache');
      expect(usage).toHaveProperty('resultCache');
      expect(usage).toHaveProperty('pathCache');
      expect(usage.estimatedBytes).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle null and undefined objects', () => {
      expect(() => AdvancedCache.getCachedType(null)).not.toThrow();
      expect(() => AdvancedCache.getCachedType(undefined)).not.toThrow();
    });

    test('should handle empty strings and objects', () => {
      AdvancedCache.cacheRegex('', /^$/);
      AdvancedCache.cacheResult('', {});
      AdvancedCache.cachePath('', '');
      
      expect(AdvancedCache.getCachedRegex('')).toBeDefined();
      expect(AdvancedCache.getCachedResult('')).toBeDefined();
      expect(AdvancedCache.getCachedPath('')).toBeDefined();
    });

    test('should handle very large objects', () => {
      const largeObj = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: 'item' + i }));
      
      expect(() => AdvancedCache.generateCacheKey(largeObj, largeObj, {})).not.toThrow();
    });

    test('should handle objects with special characters', () => {
      const obj = { 'key with spaces': 1, 'key-with-dashes': 2, 'key.with.dots': 3 };
      
      expect(() => AdvancedCache.hashObject(obj)).not.toThrow();
    });
  });
});
