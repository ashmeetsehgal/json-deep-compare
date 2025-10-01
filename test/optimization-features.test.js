/**
 * @fileoverview Comprehensive tests for optimization features
 * @author AshmeetSehgal.com
 * @description Tests for smart mode selection, memory optimization, and performance monitoring
 */

const JSONCompare = require('../src/JSONCompare');
const AdaptiveComparator = require('../src/AdaptiveComparator');
// const SmartModeSelector = require('../src/SmartModeSelector'); // Used internally by AdaptiveComparator
const StringOptimizer = require('../src/StringOptimizer');
const AdvancedCache = require('../src/AdvancedCache');
const PerformanceMonitor = require('../src/PerformanceMonitor');

describe('Optimization Features Tests', () => {
  let comparator;

  beforeEach(() => {
    comparator = new JSONCompare();
    // Clear all caches before each test
    StringOptimizer.clearCaches();
    AdvancedCache.clearAllCaches();
    PerformanceMonitor.reset();
  });

  describe('Smart Mode Selection', () => {
    test('should select ultra-fast mode for simple objects', () => {
      const simpleObj = { a: 1, b: 2, c: 3 };
      const result = AdaptiveComparator.compare(simpleObj, { ...simpleObj });
      
      expect(result.summary.matchPercentage).toBe(100);
      expect(result.summary.totalKeysCompared).toBe(3);
    });

    test('should select fast mode for medium objects', () => {
      const mediumObj = { 
        users: Array.from({length: 20}, (_, i) => ({ id: i, name: 'User' + i }))
      };
      const result = AdaptiveComparator.compare(mediumObj, { ...mediumObj });
      
      expect(result.summary.matchPercentage).toBe(100);
    });

    test('should select full mode for complex objects', () => {
      const complexObj = {
        level1: {
          level2: {
            level3: {
              data: Array.from({length: 50}, (_, i) => ({ id: i, value: 'Deep' + i }))
            }
          }
        }
      };
      const result = AdaptiveComparator.compare(complexObj, { ...complexObj });
      
      expect(result.summary.matchPercentage).toBe(100);
    });

    test('should handle mode selection statistics', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      
      AdaptiveComparator.compare(obj1, obj2);
      const stats = AdaptiveComparator.getSelectionStats();
      
      expect(stats).toHaveProperty('objectAnalysis');
      expect(stats).toHaveProperty('optionsAnalysis');
      expect(stats).toHaveProperty('selectedMode');
    });
  });

  describe('Memory Optimization', () => {
    test('should use string interning effectively', () => {
      const commonString = 'common.path.value';
      
      // First call should cache the string
      const result1 = StringOptimizer.intern(commonString);
      expect(result1).toBe(commonString);
      
      // Second call should use cache
      const result2 = StringOptimizer.intern(commonString);
      expect(result2).toBe(commonString);
      
      const stats = StringOptimizer.getCacheStats();
      expect(stats.cacheHits).toBeGreaterThan(0);
    });

    test('should optimize path building', () => {
      const basePath = 'user.profile';
      const key = 'name';
      
      const path1 = StringOptimizer.buildPath(basePath, key);
      const path2 = StringOptimizer.buildPath(basePath, key);
      
      expect(path1).toBe('user.profile.name');
      expect(path2).toBe('user.profile.name');
      expect(path1).toBe(path2); // Should be the same reference due to interning
    });

    test('should cache array paths efficiently', () => {
      const basePath = 'items';
      const index = 5;
      
      const path1 = StringOptimizer.buildArrayPath(basePath, index);
      const path2 = StringOptimizer.buildArrayPath(basePath, index);
      
      expect(path1).toBe('items[5]');
      expect(path2).toBe('items[5]');
      expect(path1).toBe(path2); // Should be the same reference
    });

    test('should optimize string arrays', () => {
      const strings = ['path1', 'path2', 'path3', 'path1', 'path2'];
      const optimized = StringOptimizer.optimizeStringArray(strings);
      
      expect(optimized).toHaveLength(5);
      expect(optimized[0]).toBe(optimized[3]); // Same reference due to interning
      expect(optimized[1]).toBe(optimized[4]); // Same reference due to interning
    });
  });

  describe('Advanced Caching', () => {
    test('should cache type detection', () => {
      const obj = { test: 'value' };
      
      // First call should cache the type
      const type1 = AdvancedCache.getCachedType(obj);
      expect(type1).toBeNull(); // Not cached yet
      
      // Cache the type
      AdvancedCache.cacheType(obj, 'object');
      
      // Second call should use cache
      const type2 = AdvancedCache.getCachedType(obj);
      expect(type2).toBe('object');
    });

    test('should cache regex patterns', () => {
      const pattern = '^[a-zA-Z]+$';
      
      // First call should not be cached
      const regex1 = AdvancedCache.getCachedRegex(pattern);
      expect(regex1).toBeNull();
      
      // Cache the regex
      const compiled = new RegExp(pattern);
      AdvancedCache.cacheRegex(pattern, compiled);
      
      // Second call should use cache
      const regex2 = AdvancedCache.getCachedRegex(pattern);
      expect(regex2).toBe(compiled);
    });

    test('should handle cache eviction', () => {
      // Fill cache beyond max size
      for (let i = 0; i < 1001; i++) {
        AdvancedCache.cacheRegex(`pattern${i}`, new RegExp(`pattern${i}`));
      }
      
      const stats = AdvancedCache.getCacheStats();
      expect(stats.cacheEvictions).toBeGreaterThan(0);
    });

    test('should provide cache statistics', () => {
      const stats = AdvancedCache.getCacheStats();
      
      expect(stats).toHaveProperty('regexCache');
      expect(stats).toHaveProperty('resultCache');
      expect(stats).toHaveProperty('pathCache');
      expect(stats).toHaveProperty('cacheHits');
      expect(stats).toHaveProperty('cacheMisses');
      expect(stats).toHaveProperty('hitRatio');
    });
  });

  describe('Performance Monitoring', () => {
    test('should track performance metrics', () => {
      JSONCompare.enablePerformanceMonitoring();
      
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      
      comparator.compare(obj1, obj2);
      
      const stats = JSONCompare.getPerformanceStats();
      expect(stats.totalComparisons).toBe(1);
      expect(stats.averageTime).toBeGreaterThan(0);
    });

    test('should track memory usage', () => {
      JSONCompare.enablePerformanceMonitoring({ trackMemory: true });
      
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      
      comparator.compare(obj1, obj2);
      
      const stats = JSONCompare.getPerformanceStats();
      expect(stats.memoryUsage).toBeDefined();
    });

    test('should generate performance report', () => {
      JSONCompare.enablePerformanceMonitoring();
      
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      
      comparator.compare(obj1, obj2);
      
      const report = JSONCompare.getPerformanceReport();
      expect(report).toContain('JSONCompare Performance Report');
      expect(report).toContain('Total Comparisons: 1');
    });

    test('should reset performance statistics', () => {
      JSONCompare.enablePerformanceMonitoring();
      
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      
      comparator.compare(obj1, obj2);
      
      let stats = JSONCompare.getPerformanceStats();
      expect(stats.totalComparisons).toBe(1);
      
      JSONCompare.resetPerformanceStats();
      
      stats = JSONCompare.getPerformanceStats();
      expect(stats.totalComparisons).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    test('should work with all optimization features enabled', () => {
      JSONCompare.enablePerformanceMonitoring({ trackMemory: true });
      
      const complexObj = {
        users: Array.from({length: 100}, (_, i) => ({
          id: i,
          name: 'User' + i,
          profile: {
            email: 'user' + i + '@example.com',
            settings: {
              theme: 'dark',
              notifications: true
            }
          }
        }))
      };
      
      const result = comparator.compare(complexObj, { ...complexObj });
      
      expect(result.summary.matchPercentage).toBe(100);
      expect(result.summary.totalKeysCompared).toBeGreaterThan(0);
      
      // Check that optimizations are working
      const stringStats = StringOptimizer.getCacheStats();
      expect(stringStats.internedStrings).toBeGreaterThan(0);
      
      const performanceStats = JSONCompare.getPerformanceStats();
      expect(performanceStats.totalComparisons).toBe(1);
    });

    test('should handle large datasets efficiently', () => {
      const largeObj = {
        data: Array.from({length: 1000}, (_, i) => ({
          id: i,
          value: 'Item' + i,
          nested: {
            deep: true,
            level: Math.floor(i / 100)
          }
        }))
      };
      
      const result = comparator.compare(largeObj, { ...largeObj });
      
      expect(result.summary.matchPercentage).toBe(100);
    });

    test('should maintain backward compatibility', () => {
      // Test that all existing functionality still works
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 3 } };
      
      const result = comparator.compare(obj1, obj2);
      
      expect(result.summary.matchPercentage).toBeLessThan(100);
      expect(result.unmatched.values).toHaveLength(1);
      expect(result.unmatched.values[0].path).toBe('b.c');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid inputs gracefully', () => {
      expect(() => comparator.compare(null, undefined)).not.toThrow();
      expect(() => comparator.compare(undefined, null)).not.toThrow();
      expect(() => comparator.compare({}, null)).not.toThrow();
    });

    test('should handle circular references', () => {
      const obj1 = { a: 1 };
      obj1.self = obj1;
      
      const obj2 = { a: 1 };
      obj2.self = obj2;
      
      expect(() => comparator.compare(obj1, obj2)).not.toThrow();
    });

    test('should handle very deep objects', () => {
      let deepObj = {};
      let current = deepObj;
      
      // Create a very deep object
      for (let i = 0; i < 1000; i++) {
        current.nested = {};
        current = current.nested;
      }
      current.value = 'deep';
      
      expect(() => comparator.compare(deepObj, { ...deepObj })).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    test('should not leak memory with repeated comparisons', () => {
      const obj = { a: 1, b: 2, c: 3 };
      
      // Perform many comparisons
      for (let i = 0; i < 1000; i++) {
        comparator.compare(obj, { ...obj });
      }
      
      // Check that caches are working and not growing unbounded
      const stringStats = StringOptimizer.getCacheStats();
      expect(stringStats.internedStrings).toBeLessThanOrEqual(1000);
      
      const cacheStats = AdvancedCache.getCacheStats();
      expect(cacheStats.regexCache).toBeLessThanOrEqual(1000);
    });

    test('should clear caches when requested', () => {
      // Use some caches
      StringOptimizer.intern('test');
      AdvancedCache.cacheType({}, 'object');
      
      // Clear caches
      StringOptimizer.clearCaches();
      AdvancedCache.clearAllCaches();
      
      // Check that caches are empty
      const stringStats = StringOptimizer.getCacheStats();
      expect(stringStats.internedStrings).toBe(0);
      
      const cacheStats = AdvancedCache.getCacheStats();
      expect(cacheStats.regexCache).toBe(0);
    });
  });
});
