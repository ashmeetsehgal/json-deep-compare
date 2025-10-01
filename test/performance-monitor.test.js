/**
 * @fileoverview Comprehensive tests for PerformanceMonitor
 * @author AshmeetSehgal.com
 * @description Tests for PerformanceMonitor to achieve high branch coverage
 */

const PerformanceMonitor = require('../src/PerformanceMonitor');

describe('PerformanceMonitor Tests', () => {
  afterEach(() => {
    PerformanceMonitor.disable();
    PerformanceMonitor.reset();
  });

  describe('enable/disable', () => {
    test('should enable monitoring', () => {
      PerformanceMonitor.enable();
      expect(PerformanceMonitor.enabled).toBe(true);
    });

    test('should disable monitoring', () => {
      PerformanceMonitor.enable();
      PerformanceMonitor.disable();
      expect(PerformanceMonitor.enabled).toBe(false);
    });

    test('should enable with options', () => {
      PerformanceMonitor.enable({ trackMemory: true, trackPools: true });
      expect(PerformanceMonitor.enabled).toBe(true);
      expect(PerformanceMonitor.options.trackMemory).toBe(true);
      expect(PerformanceMonitor.options.trackPools).toBe(true);
    });

    test('should enable with trackMemory disabled', () => {
      PerformanceMonitor.enable({ trackMemory: false });
      expect(PerformanceMonitor.options.trackMemory).toBe(false);
    });

    test('should enable with trackPools disabled', () => {
      PerformanceMonitor.enable({ trackPools: false });
      expect(PerformanceMonitor.options.trackPools).toBe(false);
    });
  });

  describe('reset', () => {
    test('should reset all statistics', () => {
      PerformanceMonitor.enable();
      PerformanceMonitor.track('test', () => {});
      PerformanceMonitor.reset();
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.totalComparisons).toBe(0);
      expect(stats.totalTime).toBe(0);
      expect(stats.minTime).toBe(Infinity);
      expect(stats.maxTime).toBe(0);
    });
  });

  describe('track', () => {
    test('should track comparison when enabled', () => {
      PerformanceMonitor.enable();
      const result = PerformanceMonitor.track('ultraFast', () => {
        return { result: 'test' };
      });
      
      expect(result).toEqual({ result: 'test' });
      const stats = PerformanceMonitor.getStats();
      expect(stats.totalComparisons).toBe(1);
      expect(stats.comparatorStats.ultraFast.count).toBe(1);
    });

    test('should not track when disabled', () => {
      PerformanceMonitor.disable();
      const result = PerformanceMonitor.track('ultraFast', () => {
        return { result: 'test' };
      });
      
      expect(result).toEqual({ result: 'test' });
      const stats = PerformanceMonitor.getStats();
      expect(stats.totalComparisons).toBe(0);
    });

    test('should track fast comparator', () => {
      PerformanceMonitor.enable();
      PerformanceMonitor.track('fast', () => {});
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.comparatorStats.fast.count).toBe(1);
    });

    test('should track full comparator', () => {
      PerformanceMonitor.enable();
      PerformanceMonitor.track('full', () => {});
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.comparatorStats.full.count).toBe(1);
    });

    test('should track boolean comparator', () => {
      PerformanceMonitor.enable();
      PerformanceMonitor.track('boolean', () => {});
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.comparatorStats.boolean.count).toBe(1);
    });

    test('should track memory usage when enabled', () => {
      PerformanceMonitor.enable({ trackMemory: true });
      PerformanceMonitor.track('ultraFast', () => {});
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.memoryUsage).toBeDefined();
    });

    test('should not track memory when trackMemory is false', () => {
      PerformanceMonitor.enable({ trackMemory: false });
      PerformanceMonitor.track('ultraFast', () => {});
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.memoryUsage.heapUsed).toBe(0);
    });

    test('should handle errors in tracked function', () => {
      PerformanceMonitor.enable();
      
      expect(() => {
        PerformanceMonitor.track('ultraFast', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.totalComparisons).toBe(1);
    });

    test('should record duration even when function throws', () => {
      PerformanceMonitor.enable();
      
      try {
        PerformanceMonitor.track('fast', () => {
          throw new Error('Test error');
        });
      } catch (e) {
        // Expected
      }
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.comparatorStats.fast.count).toBe(1);
      expect(stats.comparatorStats.fast.totalTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('recordPoolHit', () => {
    test('should record result pool hit when tracking enabled', () => {
      PerformanceMonitor.enable({ trackPools: true });
      PerformanceMonitor.recordPoolHit('result');
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.poolStats.resultPoolHits).toBe(1);
    });

    test('should record regex cache hit when tracking enabled', () => {
      PerformanceMonitor.enable({ trackPools: true });
      PerformanceMonitor.recordPoolHit('regexCache');
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.poolStats.regexCacheHits).toBe(1);
    });

    test('should not record when tracking disabled', () => {
      PerformanceMonitor.disable();
      PerformanceMonitor.recordPoolHit('result');
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.poolStats.resultPoolHits).toBe(0);
    });

    test('should not record when trackPools is false', () => {
      PerformanceMonitor.enable({ trackPools: false });
      PerformanceMonitor.recordPoolHit('result');
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.poolStats.resultPoolHits).toBe(0);
    });
  });

  describe('recordPoolMiss', () => {
    test('should record result pool miss when tracking enabled', () => {
      PerformanceMonitor.enable({ trackPools: true });
      PerformanceMonitor.recordPoolMiss('result');
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.poolStats.resultPoolMisses).toBe(1);
    });

    test('should record regex cache miss when tracking enabled', () => {
      PerformanceMonitor.enable({ trackPools: true });
      PerformanceMonitor.recordPoolMiss('regexCache');
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.poolStats.regexCacheMisses).toBe(1);
    });

    test('should not record when tracking disabled', () => {
      PerformanceMonitor.disable();
      PerformanceMonitor.recordPoolMiss('result');
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.poolStats.resultPoolMisses).toBe(0);
    });

    test('should not record when trackPools is false', () => {
      PerformanceMonitor.enable({ trackPools: false });
      PerformanceMonitor.recordPoolMiss('result');
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.poolStats.resultPoolMisses).toBe(0);
    });
  });

  describe('getStats', () => {
    test('should return statistics with no comparisons', () => {
      PerformanceMonitor.enable();
      const stats = PerformanceMonitor.getStats();
      
      expect(stats.totalComparisons).toBe(0);
      expect(stats.averageTime).toBe(0);
    });

    test('should calculate average time', () => {
      PerformanceMonitor.enable();
      PerformanceMonitor.track('ultraFast', () => {});
      PerformanceMonitor.track('ultraFast', () => {});
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.averageTime).toBeGreaterThanOrEqual(0);
      expect(stats.totalComparisons).toBe(2);
    });

    test('should calculate comparator averages', () => {
      PerformanceMonitor.enable();
      PerformanceMonitor.track('ultraFast', () => {});
      PerformanceMonitor.track('fast', () => {});
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.comparatorStats.ultraFast.averageTime).toBeDefined();
      expect(stats.comparatorStats.fast.averageTime).toBeDefined();
    });

    test('should calculate pool hit ratios', () => {
      PerformanceMonitor.enable({ trackPools: true });
      PerformanceMonitor.track('ultraFast', () => {}); // Need at least 1 comparison
      PerformanceMonitor.recordPoolHit('result');
      PerformanceMonitor.recordPoolHit('result');
      PerformanceMonitor.recordPoolMiss('result');
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.poolStats.resultPoolHitRatio).toBeCloseTo(2/3, 2);
    });

    test('should handle zero pool requests', () => {
      PerformanceMonitor.enable({ trackPools: true });
      PerformanceMonitor.track('ultraFast', () => {}); // Need at least 1 comparison
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.poolStats.resultPoolHitRatio).toBe(0);
      expect(stats.poolStats.regexCacheHitRatio).toBe(0);
    });

    test('should calculate regex cache hit ratio', () => {
      PerformanceMonitor.enable({ trackPools: true });
      PerformanceMonitor.track('ultraFast', () => {}); // Need at least 1 comparison
      PerformanceMonitor.recordPoolHit('regexCache');
      PerformanceMonitor.recordPoolMiss('regexCache');
      PerformanceMonitor.recordPoolMiss('regexCache');
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.poolStats.regexCacheHitRatio).toBeCloseTo(1/3, 2);
    });
  });

  describe('getReport', () => {
    test('should generate performance report', () => {
      PerformanceMonitor.enable();
      PerformanceMonitor.track('ultraFast', () => {});
      
      const report = PerformanceMonitor.getReport();
      expect(report).toContain('JSONCompare Performance Report');
      expect(report).toContain('Total Comparisons');
      expect(report).toContain('ultraFast');
    });

    test('should include comparator performance when calls exist', () => {
      PerformanceMonitor.enable();
      PerformanceMonitor.track('fast', () => {});
      PerformanceMonitor.track('full', () => {});
      
      const report = PerformanceMonitor.getReport();
      expect(report).toContain('fast');
      expect(report).toContain('full');
    });

    test('should include pool statistics when tracking enabled', () => {
      PerformanceMonitor.enable({ trackPools: true });
      PerformanceMonitor.recordPoolHit('result');
      
      const report = PerformanceMonitor.getReport();
      expect(report).toContain('Pool Statistics');
      expect(report).toContain('Result Pool Hit Ratio');
    });

    test('should include memory usage when tracking enabled', () => {
      PerformanceMonitor.enable({ trackMemory: true });
      PerformanceMonitor.track('ultraFast', () => {});
      
      const report = PerformanceMonitor.getReport();
      expect(report).toContain('Memory Usage');
      expect(report).toContain('Heap Used');
    });

    test('should not include pool stats when trackPools is false', () => {
      PerformanceMonitor.enable({ trackPools: false });
      PerformanceMonitor.track('ultraFast', () => {});
      
      const report = PerformanceMonitor.getReport();
      expect(report).not.toContain('Pool Statistics');
    });

    test('should not include memory when trackMemory is false', () => {
      PerformanceMonitor.enable({ trackMemory: false });
      PerformanceMonitor.track('ultraFast', () => {});
      
      const report = PerformanceMonitor.getReport();
      expect(report).not.toContain('Memory Usage');
    });

    test('should show N/A for minTime when no comparisons', () => {
      PerformanceMonitor.enable();
      
      const report = PerformanceMonitor.getReport();
      expect(report).toContain('N/A');
    });
  });

  describe('Multiple tracking scenarios', () => {
    test('should track min and max times', () => {
      PerformanceMonitor.enable();
      
      // Ensure we have measurable time differences
      PerformanceMonitor.track('ultraFast', () => {
        // Quick operation
      });
      
      PerformanceMonitor.track('full', () => {
        // Simulate longer operation
        for (let i = 0; i < 1000; i++) {
          Math.sqrt(i);
        }
      });
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.minTime).toBeLessThanOrEqual(stats.maxTime);
      expect(stats.maxTime).toBeGreaterThanOrEqual(0);
    });

    test('should track multiple comparator types', () => {
      PerformanceMonitor.enable();
      
      PerformanceMonitor.track('ultraFast', () => {});
      PerformanceMonitor.track('fast', () => {});
      PerformanceMonitor.track('full', () => {});
      PerformanceMonitor.track('boolean', () => {});
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.comparatorStats.ultraFast.count).toBe(1);
      expect(stats.comparatorStats.fast.count).toBe(1);
      expect(stats.comparatorStats.full.count).toBe(1);
      expect(stats.comparatorStats.boolean.count).toBe(1);
    });

    test('should accumulate statistics correctly', () => {
      PerformanceMonitor.enable({ trackPools: true });
      
      for (let i = 0; i < 5; i++) {
        PerformanceMonitor.track('ultraFast', () => {});
        PerformanceMonitor.recordPoolHit('result');
        PerformanceMonitor.recordPoolMiss('result');
      }
      
      const stats = PerformanceMonitor.getStats();
      expect(stats.totalComparisons).toBe(5);
      expect(stats.poolStats.resultPoolHits).toBe(5);
      expect(stats.poolStats.resultPoolMisses).toBe(5);
      expect(stats.poolStats.resultPoolHitRatio).toBe(0.5);
    });
  });
});

