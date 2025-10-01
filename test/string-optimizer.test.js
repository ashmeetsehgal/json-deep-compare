/**
 * @fileoverview Comprehensive tests for StringOptimizer
 * @author AshmeetSehgal.com
 * @description Tests for StringOptimizer to achieve high coverage
 */

const StringOptimizer = require('../src/StringOptimizer');

describe('StringOptimizer Tests', () => {
  beforeEach(() => {
    // Clear caches before each test
    StringOptimizer.internedStrings.clear();
    StringOptimizer.pathCache.clear();
    StringOptimizer.cacheAdditions = 0;
    StringOptimizer.cacheHits = 0;
    StringOptimizer.cacheMisses = 0;
  });

  describe('intern', () => {
    test('should intern string and return same reference', () => {
      const str = 'test string';
      const interned1 = StringOptimizer.intern(str);
      const interned2 = StringOptimizer.intern(str);
      expect(interned1).toBe(interned2);
      expect(StringOptimizer.internedStrings.has(str)).toBe(true);
    });

    test('should return original string for non-string input', () => {
      expect(StringOptimizer.intern(123)).toBe(123);
      expect(StringOptimizer.intern(null)).toBe(null);
      expect(StringOptimizer.intern(undefined)).toBe(undefined);
      expect(StringOptimizer.intern({})).toEqual({});
    });

    test('should handle empty string', () => {
      const result = StringOptimizer.intern('');
      expect(result).toBe('');
    });

    test('should handle cache hits', () => {
      const str = 'cached string';
      StringOptimizer.intern(str);
      const interned = StringOptimizer.intern(str);
      expect(interned).toBe(str);
    });

    test('should respect max cache size', () => {
      const originalMaxSize = StringOptimizer.maxCacheSize;
      StringOptimizer.maxCacheSize = 2;
      
      StringOptimizer.intern('string1');
      StringOptimizer.intern('string2');
      StringOptimizer.intern('string3'); // Should not be cached
      
      expect(StringOptimizer.internedStrings.size).toBeLessThanOrEqual(2);
      
      StringOptimizer.maxCacheSize = originalMaxSize;
    });

    test('should increment cache additions counter', () => {
      const initialAdditions = StringOptimizer.cacheAdditions;
      StringOptimizer.intern('new string');
      expect(StringOptimizer.cacheAdditions).toBeGreaterThan(initialAdditions);
    });
  });

  describe('buildPath', () => {
    test('should build path with base and key', () => {
      const result = StringOptimizer.buildPath('root', 'child');
      expect(result).toBe('root.child');
    });

    test('should handle empty base path', () => {
      const result = StringOptimizer.buildPath('', 'key');
      expect(result).toBe('key');
    });

    test('should handle empty key', () => {
      const result = StringOptimizer.buildPath('base', '');
      expect(result).toBe('base');
    });

    test('should cache path results', () => {
      const result1 = StringOptimizer.buildPath('root', 'child');
      const result2 = StringOptimizer.buildPath('root', 'child');
      expect(result1).toBe(result2);
    });

    test('should handle cache hits for paths', () => {
      StringOptimizer.buildPath('root', 'child');
      const initialHits = StringOptimizer.cacheHits;
      StringOptimizer.buildPath('root', 'child');
      expect(StringOptimizer.cacheHits).toBeGreaterThan(initialHits);
    });

    test('should handle cache misses for new paths', () => {
      const initialMisses = StringOptimizer.cacheMisses;
      StringOptimizer.buildPath('new', 'path');
      expect(StringOptimizer.cacheMisses).toBeGreaterThan(initialMisses);
    });
  });

  describe('buildArrayPath', () => {
    test('should build array path with index', () => {
      const result = StringOptimizer.buildArrayPath('array', 0);
      expect(result).toBe('array[0]');
    });

    test('should cache array path results', () => {
      const result1 = StringOptimizer.buildArrayPath('array', 0);
      const result2 = StringOptimizer.buildArrayPath('array', 0);
      expect(result1).toBe(result2);
    });

    test('should handle different indices', () => {
      const result1 = StringOptimizer.buildArrayPath('array', 0);
      const result2 = StringOptimizer.buildArrayPath('array', 1);
      expect(result1).not.toBe(result2);
    });
  });

  describe('optimizeStringArray', () => {
    test('should optimize array of strings', () => {
      const strings = ['test1', 'test2', 'test1'];
      const optimized = StringOptimizer.optimizeStringArray(strings);
      expect(optimized).toEqual(['test1', 'test2', 'test1']);
    });

    test('should return non-array input as-is', () => {
      expect(StringOptimizer.optimizeStringArray('string')).toBe('string');
      expect(StringOptimizer.optimizeStringArray(123)).toBe(123);
      expect(StringOptimizer.optimizeStringArray(null)).toBe(null);
    });

    test('should handle empty array', () => {
      const result = StringOptimizer.optimizeStringArray([]);
      expect(result).toEqual([]);
    });
  });

  describe('clearCaches', () => {
    test('should clear all caches', () => {
      StringOptimizer.intern('test');
      StringOptimizer.buildPath('root', 'child');
      
      StringOptimizer.clearCaches();
      
      expect(StringOptimizer.internedStrings.size).toBe(0);
      expect(StringOptimizer.pathCache.size).toBe(0);
    });

    test('should reset counters', () => {
      StringOptimizer.intern('test');
      StringOptimizer.buildPath('root', 'child');
      
      StringOptimizer.clearCaches();
      
      expect(StringOptimizer.cacheAdditions).toBe(0);
    });
  });

  describe('getCacheStats', () => {
    test('should return cache statistics', () => {
      StringOptimizer.intern('test');
      StringOptimizer.buildPath('root', 'child');
      
      const stats = StringOptimizer.getCacheStats();
      
      expect(stats).toHaveProperty('internedStrings');
      expect(stats).toHaveProperty('pathCache');
      expect(stats).toHaveProperty('cacheAdditions');
      expect(stats).toHaveProperty('cacheHits');
      expect(stats).toHaveProperty('cacheMisses');
    });

    test('should return accurate statistics', () => {
      StringOptimizer.intern('test1');
      StringOptimizer.intern('test1'); // Cache hit
      StringOptimizer.buildPath('root', 'child');
      
      const stats = StringOptimizer.getCacheStats();
      
      expect(stats.internedStrings).toBeGreaterThan(0);
      expect(stats.pathCache).toBeGreaterThan(0);
      expect(stats.cacheHits).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const result = StringOptimizer.intern(longString);
      expect(result).toBe(longString);
    });

    test('should handle special characters', () => {
      const specialString = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const result = StringOptimizer.intern(specialString);
      expect(result).toBe(specialString);
    });

    test('should handle unicode strings', () => {
      const unicodeString = '🚀🌟💫✨';
      const result = StringOptimizer.intern(unicodeString);
      expect(result).toBe(unicodeString);
    });

    test('should handle null and undefined in paths', () => {
      expect(() => StringOptimizer.buildPath(null, 'key')).not.toThrow();
      expect(() => StringOptimizer.buildPath('base', null)).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('should handle many string operations efficiently', () => {
      const start = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        StringOptimizer.intern(`string${i}`);
        StringOptimizer.buildPath('root', `child${i}`);
      }
      
      const end = Date.now();
      expect(end - start).toBeLessThan(1000); // Should complete in less than 1 second
    });

    test('should benefit from caching on repeated operations', () => {
      // Clear cache first
      StringOptimizer.clearCaches();
      
      const start = Date.now();
      
      // First pass - cache misses
      for (let i = 0; i < 100; i++) {
        StringOptimizer.intern('repeated string');
        StringOptimizer.buildPath('root', 'child');
      }
      
      
      // Second pass - cache hits
      for (let i = 0; i < 100; i++) {
        StringOptimizer.intern('repeated string');
        StringOptimizer.buildPath('root', 'child');
      }
      
      const end = Date.now();
      
      // Both passes should complete quickly
      expect(end - start).toBeLessThan(1000);
    });
  });
});
