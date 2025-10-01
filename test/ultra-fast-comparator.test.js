/**
 * @fileoverview Comprehensive tests for UltraFastComparator
 * @author AshmeetSehgal.com
 * @description Tests for UltraFastComparator to achieve high coverage
 */

const UltraFastComparator = require('../src/UltraFastComparator');

describe('UltraFastComparator Tests', () => {
  describe('ultraFastCompare', () => {
    test('should return true for identical primitives', () => {
      expect(UltraFastComparator.ultraFastCompare(1, 1)).toBe(true);
      expect(UltraFastComparator.ultraFastCompare('hello', 'hello')).toBe(true);
      expect(UltraFastComparator.ultraFastCompare(true, true)).toBe(true);
      expect(UltraFastComparator.ultraFastCompare(null, null)).toBe(true);
      expect(UltraFastComparator.ultraFastCompare(undefined, undefined)).toBe(true);
    });

    test('should return false for different primitives', () => {
      expect(UltraFastComparator.ultraFastCompare(1, 2)).toBe(false);
      expect(UltraFastComparator.ultraFastCompare('hello', 'world')).toBe(false);
      expect(UltraFastComparator.ultraFastCompare(true, false)).toBe(false);
      expect(UltraFastComparator.ultraFastCompare(null, undefined)).toBe(false);
    });

    test('should handle identical objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      expect(UltraFastComparator.ultraFastCompare(obj1, obj2)).toBe(true);
    });

    test('should handle different objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 3 };
      expect(UltraFastComparator.ultraFastCompare(obj1, obj2)).toBe(false);
    });

    test('should handle identical arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      expect(UltraFastComparator.ultraFastCompare(arr1, arr2)).toBe(true);
    });

    test('should handle different arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 4];
      expect(UltraFastComparator.ultraFastCompare(arr1, arr2)).toBe(false);
    });

    test('should handle null comparisons', () => {
      expect(UltraFastComparator.ultraFastCompare(null, null)).toBe(true);
      expect(UltraFastComparator.ultraFastCompare(null, undefined)).toBe(false);
    });

    test('should handle undefined comparisons', () => {
      expect(UltraFastComparator.ultraFastCompare(undefined, undefined)).toBe(true);
      expect(UltraFastComparator.ultraFastCompare(undefined, null)).toBe(false);
    });
  });

  describe('ultraFastCompareArrays', () => {
    test('should compare identical arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      expect(UltraFastComparator.ultraFastCompareArrays(arr1, arr2)).toBe(true);
    });

    test('should compare different arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 4];
      expect(UltraFastComparator.ultraFastCompareArrays(arr1, arr2)).toBe(false);
    });

    test('should handle empty arrays', () => {
      expect(UltraFastComparator.ultraFastCompareArrays([], [])).toBe(true);
    });

    test('should handle arrays with different lengths', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2];
      expect(UltraFastComparator.ultraFastCompareArrays(arr1, arr2)).toBe(false);
    });

    test('should handle nested arrays', () => {
      const arr1 = [[1, 2], [3, 4]];
      const arr2 = [[1, 2], [3, 4]];
      expect(UltraFastComparator.ultraFastCompareArrays(arr1, arr2)).toBe(true);
    });

    test('should handle arrays with objects', () => {
      const arr1 = [{ a: 1 }, { b: 2 }];
      const arr2 = [{ a: 1 }, { b: 2 }];
      expect(UltraFastComparator.ultraFastCompareArrays(arr1, arr2)).toBe(true);
    });
  });

  describe('ultraFastCompareObjects', () => {
    test('should compare identical plain objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      expect(UltraFastComparator.ultraFastCompareObjects(obj1, obj2)).toBe(true);
    });

    test('should compare different plain objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 3 };
      expect(UltraFastComparator.ultraFastCompareObjects(obj1, obj2)).toBe(false);
    });

    test('should handle empty objects', () => {
      expect(UltraFastComparator.ultraFastCompareObjects({}, {})).toBe(true);
    });

    test('should handle objects with different keys', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, c: 2 };
      expect(UltraFastComparator.ultraFastCompareObjects(obj1, obj2)).toBe(false);
    });

    test('should handle nested objects', () => {
      const obj1 = { a: { b: 1 }, c: 2 };
      const obj2 = { a: { b: 1 }, c: 2 };
      expect(UltraFastComparator.ultraFastCompareObjects(obj1, obj2)).toBe(true);
    });

    test('should return false for non-plain objects', () => {
      const obj1 = Object.create(null);
      const obj2 = Object.create(null);
      expect(UltraFastComparator.ultraFastCompareObjects(obj1, obj2)).toBe(false);
    });

    test('should return false for mixed object types', () => {
      const obj1 = { a: 1 };
      const obj2 = Object.create(null);
      expect(UltraFastComparator.ultraFastCompareObjects(obj1, obj2)).toBe(false);
    });
  });

  describe('ultraFastCompareArraysWithCounts', () => {
    test('should return correct counts for identical arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      const result = UltraFastComparator.ultraFastCompareArraysWithCounts(arr1, arr2);
      expect(result.matchPercentage).toBe(100);
      expect(result.totalKeysCompared).toBe(3);
      expect(result.totalMatched).toBe(3);
      expect(result.totalUnmatched).toBe(0);
    });

    test('should return correct counts for different arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 4];
      const result = UltraFastComparator.ultraFastCompareArraysWithCounts(arr1, arr2);
      expect(result.matchPercentage).toBeLessThan(100);
      expect(result.totalKeysCompared).toBe(3);
    });

    test('should handle arrays with different lengths', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2];
      const result = UltraFastComparator.ultraFastCompareArraysWithCounts(arr1, arr2);
      expect(result.matchPercentage).toBe(0);
      expect(result.totalKeysCompared).toBe(3);
      expect(result.totalMatched).toBe(0);
      expect(result.totalUnmatched).toBe(3);
    });

    test('should handle empty arrays', () => {
      const result = UltraFastComparator.ultraFastCompareArraysWithCounts([], []);
      expect(result.matchPercentage).toBe(100);
      expect(result.totalKeysCompared).toBe(0);
      expect(result.totalMatched).toBe(0);
      expect(result.totalUnmatched).toBe(0);
    });

    test('should handle nested arrays', () => {
      const arr1 = [[1, 2], [3, 4]];
      const arr2 = [[1, 2], [3, 4]];
      const result = UltraFastComparator.ultraFastCompareArraysWithCounts(arr1, arr2);
      expect(result.matchPercentage).toBe(100);
    });
  });

  describe('ultraFastCompareWithCounts', () => {
    test('should return correct counts for identical primitives', () => {
      const result = UltraFastComparator.ultraFastCompareWithCounts(1, 1);
      expect(result.matchPercentage).toBe(100);
      expect(result.totalKeysCompared).toBe(1);
      expect(result.totalMatched).toBe(1);
      expect(result.totalUnmatched).toBe(0);
    });

    test('should return correct counts for different primitives', () => {
      const result = UltraFastComparator.ultraFastCompareWithCounts(1, 2);
      expect(result.matchPercentage).toBe(0);
      expect(result.totalKeysCompared).toBe(1);
      expect(result.totalMatched).toBe(0);
      expect(result.totalUnmatched).toBe(1);
    });

    test('should handle objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      const result = UltraFastComparator.ultraFastCompareWithCounts(obj1, obj2);
      expect(result.matchPercentage).toBe(100);
    });

    test('should handle arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      const result = UltraFastComparator.ultraFastCompareWithCounts(arr1, arr2);
      expect(result.matchPercentage).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    test('should handle NaN values', () => {
      expect(UltraFastComparator.ultraFastCompare(NaN, NaN)).toBe(true);
      expect(UltraFastComparator.ultraFastCompare(NaN, 1)).toBe(false);
    });

    test('should handle Infinity values', () => {
      expect(UltraFastComparator.ultraFastCompare(Infinity, Infinity)).toBe(true);
      expect(UltraFastComparator.ultraFastCompare(Infinity, -Infinity)).toBe(false);
    });

    test('should handle special numbers', () => {
      expect(UltraFastComparator.ultraFastCompare(0, -0)).toBe(true);
      expect(UltraFastComparator.ultraFastCompare(0, 0)).toBe(true);
    });

    test('should handle circular references', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      obj1.self = obj1;
      obj2.self = obj2;
      
      // UltraFastComparator doesn't handle circular references, so it will throw
      expect(() => UltraFastComparator.ultraFastCompare(obj1, obj2)).toThrow();
    });

    test('should handle very deep nesting', () => {
      let obj1 = {};
      let obj2 = {};
      let current1 = obj1;
      let current2 = obj2;
      
      for (let i = 0; i < 100; i++) {
        current1.nested = {};
        current2.nested = {};
        current1 = current1.nested;
        current2 = current2.nested;
      }
      
      expect(UltraFastComparator.ultraFastCompare(obj1, obj2)).toBe(true);
    });
  });

  describe('Performance', () => {
    test('should handle large objects efficiently', () => {
      const largeObj1 = {};
      const largeObj2 = {};
      
      for (let i = 0; i < 1000; i++) {
        largeObj1[`key${i}`] = i;
        largeObj2[`key${i}`] = i;
      }
      
      const start = Date.now();
      const result = UltraFastComparator.ultraFastCompare(largeObj1, largeObj2);
      const end = Date.now();
      
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
      expect(result).toBe(true);
    });

    test('should handle large arrays efficiently', () => {
      const largeArr1 = Array.from({ length: 1000 }, (_, i) => i);
      const largeArr2 = Array.from({ length: 1000 }, (_, i) => i);
      
      const start = Date.now();
      const result = UltraFastComparator.ultraFastCompare(largeArr1, largeArr2);
      const end = Date.now();
      
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
      expect(result).toBe(true);
    });

    test('should be faster than regular comparison for simple cases', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 1, b: 2, c: 3 };
      
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        UltraFastComparator.ultraFastCompare(obj1, obj2);
      }
      const end = Date.now();
      
      expect(end - start).toBeLessThan(50); // Should complete in less than 50ms
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed objects gracefully', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      
      // Create a malformed object
      Object.defineProperty(obj1, 'b', {
        get() { throw new Error('Access error'); }
      });
      
      expect(() => UltraFastComparator.ultraFastCompare(obj1, obj2)).not.toThrow();
    });

    test('should handle non-enumerable properties', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      
      Object.defineProperty(obj1, 'b', {
        value: 2,
        enumerable: false
      });
      
      expect(UltraFastComparator.ultraFastCompare(obj1, obj2)).toBe(true);
    });
  });
});
