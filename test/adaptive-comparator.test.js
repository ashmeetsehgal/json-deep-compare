/**
 * @fileoverview Comprehensive tests for AdaptiveComparator
 * @author AshmeetSehgal.com
 * @description Tests for AdaptiveComparator to achieve high coverage
 */

const AdaptiveComparator = require('../src/AdaptiveComparator');
const PerformanceMonitor = require('../src/PerformanceMonitor');

describe('AdaptiveComparator Tests', () => {
  beforeEach(() => {
    // Disable performance monitoring for most tests
    PerformanceMonitor.disable();
  });

  describe('compare', () => {
    test('should compare identical objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      const result = AdaptiveComparator.compare(obj1, obj2, {});
      expect(result).toHaveProperty('summary');
    });

    test('should compare different objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 2 };
      const result = AdaptiveComparator.compare(obj1, obj2, {});
      expect(result).toHaveProperty('summary');
    });

    test('should handle null values', () => {
      const result = AdaptiveComparator.compare(null, null, {});
      expect(result).toHaveProperty('summary');
    });

    test('should handle arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      const result = AdaptiveComparator.compare(arr1, arr2, {});
      expect(result).toHaveProperty('summary');
    });
  });

  describe('routeToComparator', () => {
    test('should route to ultraFast mode', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      const result = AdaptiveComparator.routeToComparator('ultraFast', obj1, obj2, {});
      expect(result).toBeDefined();
    });

    test('should route to fast mode', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      const result = AdaptiveComparator.routeToComparator('fast', obj1, obj2, {});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('summary');
    });

    test('should route to full mode', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      const result = AdaptiveComparator.routeToComparator('full', obj1, obj2, {});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('summary');
    });

    test('should use full mode as fallback for unknown mode', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      const result = AdaptiveComparator.routeToComparator('unknown', obj1, obj2, {});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('summary');
    });
  });

  describe('ultraFastCompare', () => {
    test('should perform ultra-fast comparison', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      const result = AdaptiveComparator.ultraFastCompare(obj1, obj2);
      expect(result).toBeDefined();
    });

    test('should handle primitives', () => {
      const result = AdaptiveComparator.ultraFastCompare(5, 5);
      expect(result).toBeDefined();
    });
  });

  describe('fastCompare', () => {
    test('should handle fast comparison with primitives', () => {
      const result = AdaptiveComparator.fastCompare(5, 10);
      expect(result).toHaveProperty('summary');
      expect(result.summary).toHaveProperty('matchPercentage');
    });

    test('should handle fast comparison with objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 3 };
      const result = AdaptiveComparator.fastCompare(obj1, obj2);
      expect(result).toHaveProperty('summary');
    });

    test('should handle primitive mismatch', () => {
      const result = AdaptiveComparator.fastCompare(5, 10);
      expect(result.unmatched.values).toBeDefined();
      expect(result.unmatched.values.length).toBeGreaterThan(0);
    });

    test('should handle null primitives', () => {
      const result = AdaptiveComparator.fastCompare(null, 10);
      expect(result).toHaveProperty('summary');
    });

    test('should handle matching primitives', () => {
      const result = AdaptiveComparator.fastCompare("test", "test");
      expect(result).toHaveProperty('summary');
      expect(result.summary.matchPercentage).toBe(100);
    });
  });

  describe('fullCompare', () => {
    test('should perform full comparison', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2 } };
      const result = AdaptiveComparator.fullCompare(obj1, obj2, {});
      expect(result).toHaveProperty('summary');
    });

    test('should handle options in full comparison', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      const options = { ignoredKeys: ['b'] };
      const result = AdaptiveComparator.fullCompare(obj1, obj2, options);
      expect(result).toHaveProperty('summary');
    });

    test('should handle null options', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      const result = AdaptiveComparator.fullCompare(obj1, obj2, null);
      expect(result).toHaveProperty('summary');
    });

    test('should handle undefined options', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      const result = AdaptiveComparator.fullCompare(obj1, obj2, undefined);
      expect(result).toHaveProperty('summary');
    });
  });

  describe('getSelectionStats', () => {
    test('should get selection stats for simple objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      const stats = AdaptiveComparator.getSelectionStats(obj1, obj2, {});
      expect(stats).toHaveProperty('selectedMode');
      expect(stats).toHaveProperty('objectAnalysis');
      expect(stats).toHaveProperty('optionsAnalysis');
      expect(stats).toHaveProperty('reasoning');
    });

    test('should get stats for complex objects', () => {
      const obj1 = { a: 1, b: { c: 2, d: { e: 3 } } };
      const obj2 = { a: 1, b: { c: 2, d: { e: 3 } } };
      const stats = AdaptiveComparator.getSelectionStats(obj1, obj2, {});
      expect(stats).toBeDefined();
    });

    test('should get stats with regex options', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      const options = { regexChecks: { 'a': /\d+/ } };
      const stats = AdaptiveComparator.getSelectionStats(obj1, obj2, options);
      expect(stats.selectedMode).toBe('full');
    });
  });

  describe('forceMode', () => {
    test('should force ultraFast mode', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2 } };
      const result = AdaptiveComparator.forceMode('ultraFast', obj1, obj2, {});
      expect(result).toBeDefined();
    });

    test('should force fast mode', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      const result = AdaptiveComparator.forceMode('fast', obj1, obj2, {});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('summary');
    });

    test('should force full mode', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      const result = AdaptiveComparator.forceMode('full', obj1, obj2, {});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('summary');
    });

    test('should track performance when forcing mode', () => {
      PerformanceMonitor.enable();
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      AdaptiveComparator.forceMode('fast', obj1, obj2, {});
      const stats = PerformanceMonitor.getStats();
      expect(stats.totalComparisons).toBeGreaterThan(0);
      PerformanceMonitor.disable();
    });
  });

  describe('compareWithDebug', () => {
    test('should compare with debug info', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      const result = AdaptiveComparator.compareWithDebug(obj1, obj2, {});
      expect(result).toHaveProperty('_debug');
      expect(result._debug).toHaveProperty('modeSelection');
      expect(result._debug).toHaveProperty('performance');
    });

    test('should include mode selection reasoning', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2 } };
      const result = AdaptiveComparator.compareWithDebug(obj1, obj2, {});
      expect(result._debug.modeSelection).toHaveProperty('reasoning');
    });

    test('should include performance stats in debug', () => {
      PerformanceMonitor.enable();
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      const result = AdaptiveComparator.compareWithDebug(obj1, obj2, {});
      expect(result._debug.performance).toBeDefined();
      PerformanceMonitor.disable();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty objects', () => {
      const result = AdaptiveComparator.compare({}, {}, {});
      expect(result).toHaveProperty('summary');
    });

    test('should handle empty arrays', () => {
      const result = AdaptiveComparator.compare([], [], {});
      expect(result).toHaveProperty('summary');
    });

    test('should handle mixed types', () => {
      const result = AdaptiveComparator.compare({a: 1}, [1], {});
      expect(result).toHaveProperty('summary');
    });

    test('should handle very large objects', () => {
      const largeObj = {};
      for (let i = 0; i < 100; i++) {
        largeObj[`key${i}`] = i;
      }
      const result = AdaptiveComparator.compare(largeObj, largeObj, {});
      expect(result).toHaveProperty('summary');
    });
  });
});

