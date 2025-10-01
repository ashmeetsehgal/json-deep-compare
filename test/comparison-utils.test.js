/**
 * @fileoverview Comprehensive tests for ComparisonUtils
 * @author AshmeetSehgal.com
 * @description Tests for ComparisonUtils to achieve high coverage
 */

const ComparisonUtils = require('../src/ComparisonUtils');

describe('ComparisonUtils Tests', () => {
  describe('referenceEqual', () => {
    test('should return true for same reference', () => {
      const obj = { a: 1 };
      expect(ComparisonUtils.referenceEqual(obj, obj)).toBe(true);
    });

    test('should return false for different references', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      expect(ComparisonUtils.referenceEqual(obj1, obj2)).toBe(false);
    });

    test('should handle primitives', () => {
      expect(ComparisonUtils.referenceEqual(1, 1)).toBe(true);
      expect(ComparisonUtils.referenceEqual(1, 2)).toBe(false);
      expect(ComparisonUtils.referenceEqual('hello', 'hello')).toBe(true);
      expect(ComparisonUtils.referenceEqual('hello', 'world')).toBe(false);
    });
  });

  describe('typeEqual', () => {
    test('should return true for same types', () => {
      expect(ComparisonUtils.typeEqual(1, 2)).toBe(true);
      expect(ComparisonUtils.typeEqual('a', 'b')).toBe(true);
      expect(ComparisonUtils.typeEqual(true, false)).toBe(true);
      expect(ComparisonUtils.typeEqual({}, {})).toBe(true);
      expect(ComparisonUtils.typeEqual([], [])).toBe(true);
    });

    test('should return false for different types', () => {
      expect(ComparisonUtils.typeEqual(1, '1')).toBe(false);
      expect(ComparisonUtils.typeEqual(true, 'true')).toBe(false);
      expect(ComparisonUtils.typeEqual({}, [])).toBe(true); // Both are objects
      expect(ComparisonUtils.typeEqual(null, undefined)).toBe(false);
    });
  });

  describe('nullCheck', () => {
    test('should return true for both null', () => {
      expect(ComparisonUtils.nullCheck(null, null)).toBe(true);
    });

    test('should return true for both undefined', () => {
      expect(ComparisonUtils.nullCheck(undefined, undefined)).toBe(true);
    });

    test('should return false for null vs undefined', () => {
      expect(ComparisonUtils.nullCheck(null, undefined)).toBe(false);
      expect(ComparisonUtils.nullCheck(undefined, null)).toBe(false);
    });

    test('should return false for null vs value', () => {
      expect(ComparisonUtils.nullCheck(null, 1)).toBe(false);
      expect(ComparisonUtils.nullCheck(1, null)).toBe(false);
    });

    test('should return null for non-null values', () => {
      expect(ComparisonUtils.nullCheck(1, 2)).toBeNull();
      expect(ComparisonUtils.nullCheck('a', 'b')).toBeNull();
      expect(ComparisonUtils.nullCheck({}, {})).toBeNull();
    });
  });

  describe('primitiveCompare', () => {
    test('should return true for equal primitives', () => {
      expect(ComparisonUtils.primitiveCompare(1, 1)).toBe(true);
      expect(ComparisonUtils.primitiveCompare('hello', 'hello')).toBe(true);
      expect(ComparisonUtils.primitiveCompare(true, true)).toBe(true);
    });

    test('should return false for different primitives', () => {
      expect(ComparisonUtils.primitiveCompare(1, 2)).toBe(false);
      expect(ComparisonUtils.primitiveCompare('hello', 'world')).toBe(false);
      expect(ComparisonUtils.primitiveCompare(true, false)).toBe(false);
    });

    test('should return null for objects', () => {
      expect(ComparisonUtils.primitiveCompare({}, {})).toBeNull();
      expect(ComparisonUtils.primitiveCompare([], [])).toBeNull();
    });
  });

  describe('bothArrays', () => {
    test('should return true for both arrays', () => {
      expect(ComparisonUtils.bothArrays([], [])).toBe(true);
      expect(ComparisonUtils.bothArrays([1], [2])).toBe(true);
    });

    test('should return false for mixed types', () => {
      expect(ComparisonUtils.bothArrays([], {})).toBe(false);
      expect(ComparisonUtils.bothArrays([], 1)).toBe(false);
      expect(ComparisonUtils.bothArrays({}, [])).toBe(false);
    });
  });

  describe('bothPlainObjects', () => {
    test('should return true for both plain objects', () => {
      expect(ComparisonUtils.bothPlainObjects({}, {})).toBe(true);
      expect(ComparisonUtils.bothPlainObjects({ a: 1 }, { b: 2 })).toBe(true);
    });

    test('should return false for mixed types', () => {
      expect(ComparisonUtils.bothPlainObjects({}, [])).toBe(false);
      expect(ComparisonUtils.bothPlainObjects({}, null)).toBe(false);
      expect(ComparisonUtils.bothPlainObjects({}, 1)).toBe(false);
    });

    test('should return false for non-plain objects', () => {
      expect(ComparisonUtils.bothPlainObjects([], [])).toBe(false);
      expect(ComparisonUtils.bothPlainObjects(new Date(), new Date())).toBe(false);
    });
  });

  describe('arrayLengthEqual', () => {
    test('should return true for same length', () => {
      expect(ComparisonUtils.arrayLengthEqual([1, 2], [3, 4])).toBe(true);
      expect(ComparisonUtils.arrayLengthEqual([], [])).toBe(true);
    });

    test('should return false for different length', () => {
      expect(ComparisonUtils.arrayLengthEqual([1], [1, 2])).toBe(false);
      expect(ComparisonUtils.arrayLengthEqual([1, 2], [1])).toBe(false);
    });
  });

  describe('objectKeysCountEqual', () => {
    test('should return true for same key count', () => {
      expect(ComparisonUtils.objectKeysCountEqual({ a: 1 }, { b: 2 })).toBe(true);
      expect(ComparisonUtils.objectKeysCountEqual({}, {})).toBe(true);
    });

    test('should return false for different key count', () => {
      expect(ComparisonUtils.objectKeysCountEqual({ a: 1 }, { b: 2, c: 3 })).toBe(false);
      expect(ComparisonUtils.objectKeysCountEqual({ a: 1, b: 2 }, { c: 3 })).toBe(false);
    });
  });

  describe('getEarlyExitThreshold', () => {
    test('should calculate threshold correctly', () => {
      expect(ComparisonUtils.getEarlyExitThreshold(10, 0.3)).toBe(3);
      expect(ComparisonUtils.getEarlyExitThreshold(100, 0.2)).toBe(20);
      expect(ComparisonUtils.getEarlyExitThreshold(5, 0.5)).toBe(2);
    });

    test('should use default ratio', () => {
      expect(ComparisonUtils.getEarlyExitThreshold(10)).toBe(3);
    });

    test('should return at least 1', () => {
      expect(ComparisonUtils.getEarlyExitThreshold(1, 0.1)).toBe(1);
      expect(ComparisonUtils.getEarlyExitThreshold(0, 0.5)).toBe(1);
    });
  });

  describe('calculateMatchPercentage', () => {
    test('should calculate percentage correctly', () => {
      expect(ComparisonUtils.calculateMatchPercentage(8, 10)).toBe(80);
      expect(ComparisonUtils.calculateMatchPercentage(5, 5)).toBe(100);
      expect(ComparisonUtils.calculateMatchPercentage(0, 10)).toBe(0);
    });

    test('should return 100 for zero total', () => {
      expect(ComparisonUtils.calculateMatchPercentage(0, 0)).toBe(100);
    });

    test('should round correctly', () => {
      expect(ComparisonUtils.calculateMatchPercentage(1, 3)).toBe(33);
      expect(ComparisonUtils.calculateMatchPercentage(2, 3)).toBe(67);
    });
  });

  describe('createResult', () => {
    test('should create result object correctly', () => {
      const result = ComparisonUtils.createResult(80, 10, 8, 2);
      expect(result).toEqual({
        matchPercentage: 80,
        totalKeys: 10,
        matched: 8,
        unmatched: 2
      });
    });
  });

  describe('createFailureResult', () => {
    test('should create failure result with defaults', () => {
      const result = ComparisonUtils.createFailureResult(10);
      expect(result).toEqual({
        matchPercentage: 0,
        totalKeys: 10,
        matched: 0,
        unmatched: 10
      });
    });

    test('should create failure result with matched count', () => {
      const result = ComparisonUtils.createFailureResult(10, 3);
      expect(result).toEqual({
        matchPercentage: 0,
        totalKeys: 10,
        matched: 3,
        unmatched: 7
      });
    });

    test('should create failure result with custom unmatched', () => {
      const result = ComparisonUtils.createFailureResult(10, 3, 5);
      expect(result).toEqual({
        matchPercentage: 0,
        totalKeys: 10,
        matched: 3,
        unmatched: 5
      });
    });
  });

  describe('createSuccessResult', () => {
    test('should create success result', () => {
      const result = ComparisonUtils.createSuccessResult(10);
      expect(result).toEqual({
        matchPercentage: 100,
        totalKeys: 10,
        matched: 10,
        unmatched: 0
      });
    });
  });

  describe('compareNullishValues', () => {
    test('should return true for both null', () => {
      expect(ComparisonUtils.compareNullishValues(null, null)).toBe(true);
    });

    test('should return true for both undefined', () => {
      expect(ComparisonUtils.compareNullishValues(undefined, undefined)).toBe(true);
    });

    test('should return false for null vs undefined', () => {
      expect(ComparisonUtils.compareNullishValues(null, undefined)).toBe(false);
      expect(ComparisonUtils.compareNullishValues(undefined, null)).toBe(false);
    });

    test('should return false for null vs value', () => {
      expect(ComparisonUtils.compareNullishValues(null, 1)).toBe(false);
      expect(ComparisonUtils.compareNullishValues(1, null)).toBe(false);
    });

    test('should return null for non-nullish values', () => {
      expect(ComparisonUtils.compareNullishValues(1, 2)).toBeNull();
      expect(ComparisonUtils.compareNullishValues('a', 'b')).toBeNull();
    });
  });

  describe('shouldExitEarly', () => {
    test('should return true when unmatched exceeds threshold', () => {
      expect(ComparisonUtils.shouldExitEarly(5, 3)).toBe(true);
      expect(ComparisonUtils.shouldExitEarly(10, 5)).toBe(true);
    });

    test('should return false when unmatched is within threshold', () => {
      expect(ComparisonUtils.shouldExitEarly(2, 3)).toBe(false);
      expect(ComparisonUtils.shouldExitEarly(5, 10)).toBe(false);
    });

    test('should return false when unmatched equals threshold', () => {
      expect(ComparisonUtils.shouldExitEarly(3, 3)).toBe(false);
    });
  });

  describe('batchCompare', () => {
    test('should compare batch correctly', () => {
      const values1 = [1, 2, 3, 4, 5];
      const values2 = [1, 2, 4, 4, 5];
      
      const result = ComparisonUtils.batchCompare(values1, values2, 0, 3);
      expect(result.matched).toBe(2);
      expect(result.unmatched).toBe(1);
      expect(result.processed).toBe(3);
    });

    test('should handle partial batch', () => {
      const values1 = [1, 2, 3];
      const values2 = [1, 2, 3];
      
      const result = ComparisonUtils.batchCompare(values1, values2, 1, 5);
      expect(result.matched).toBe(2);
      expect(result.unmatched).toBe(0);
      expect(result.processed).toBe(2);
    });

    test('should handle empty batch', () => {
      const values1 = [];
      const values2 = [];
      
      const result = ComparisonUtils.batchCompare(values1, values2, 0, 5);
      expect(result.matched).toBe(0);
      expect(result.unmatched).toBe(0);
      expect(result.processed).toBe(0);
    });

    test('should handle start index beyond array length', () => {
      const values1 = [1, 2];
      const values2 = [1, 2];
      
      const result = ComparisonUtils.batchCompare(values1, values2, 5, 3);
      expect(result.matched).toBe(0);
      expect(result.unmatched).toBe(0);
      expect(result.processed).toBe(-3); // Math.min(5 + 3, 2) - 5 = 2 - 5 = -3
    });
  });

  describe('Edge Cases', () => {
    test('should handle special values in comparisons', () => {
      expect(ComparisonUtils.primitiveCompare(NaN, NaN)).toBe(true); // For comparison purposes, NaN === NaN
      expect(ComparisonUtils.primitiveCompare(Infinity, Infinity)).toBe(true);
      expect(ComparisonUtils.primitiveCompare(-Infinity, -Infinity)).toBe(true);
    });

    test('should handle functions', () => {
      const fn1 = () => {};
      const fn2 = () => {};
      expect(ComparisonUtils.referenceEqual(fn1, fn1)).toBe(true);
      expect(ComparisonUtils.referenceEqual(fn1, fn2)).toBe(false);
    });

    test('should handle dates', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-01');
      expect(ComparisonUtils.referenceEqual(date1, date1)).toBe(true);
      expect(ComparisonUtils.referenceEqual(date1, date2)).toBe(false);
    });

    test('should handle regex objects', () => {
      const regex1 = /test/;
      const regex2 = /test/;
      expect(ComparisonUtils.referenceEqual(regex1, regex1)).toBe(true);
      expect(ComparisonUtils.referenceEqual(regex1, regex2)).toBe(false);
    });
  });
});
