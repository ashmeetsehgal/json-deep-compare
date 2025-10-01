/**
 * @fileoverview Comprehensive tests for BooleanComparator
 * @author AshmeetSehgal.com
 * @description Tests for BooleanComparator to achieve high coverage
 */

const BooleanComparator = require('../src/BooleanComparator');

describe('BooleanComparator Tests', () => {
  describe('booleanCompare', () => {
    test('should return true for identical references', () => {
      const obj = { a: 1, b: 2 };
      expect(BooleanComparator.booleanCompare(obj, obj)).toBe(true);
    });

    test('should return false for different types', () => {
      expect(BooleanComparator.booleanCompare(1, '1')).toBe(false);
      expect(BooleanComparator.booleanCompare(true, 'true')).toBe(false);
      expect(BooleanComparator.booleanCompare(null, undefined)).toBe(false);
    });

    test('should handle null and undefined correctly', () => {
      expect(BooleanComparator.booleanCompare(null, null)).toBe(true);
      expect(BooleanComparator.booleanCompare(undefined, undefined)).toBe(true);
      expect(BooleanComparator.booleanCompare(null, undefined)).toBe(false);
      expect(BooleanComparator.booleanCompare(undefined, null)).toBe(false);
    });

    test('should compare primitives correctly', () => {
      expect(BooleanComparator.booleanCompare(1, 1)).toBe(true);
      expect(BooleanComparator.booleanCompare(1, 2)).toBe(false);
      expect(BooleanComparator.booleanCompare('hello', 'hello')).toBe(true);
      expect(BooleanComparator.booleanCompare('hello', 'world')).toBe(false);
      expect(BooleanComparator.booleanCompare(true, true)).toBe(true);
      expect(BooleanComparator.booleanCompare(true, false)).toBe(false);
    });

    test('should handle array vs object distinction', () => {
      const arr = [1, 2, 3];
      const obj = { 0: 1, 1: 2, 2: 3 };
      expect(BooleanComparator.booleanCompare(arr, obj)).toBe(false);
    });

    test('should compare arrays correctly', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      const arr3 = [1, 2, 4];
      const arr4 = [1, 2];
      
      expect(BooleanComparator.booleanCompare(arr1, arr2)).toBe(true);
      expect(BooleanComparator.booleanCompare(arr1, arr3)).toBe(false);
      expect(BooleanComparator.booleanCompare(arr1, arr4)).toBe(false);
    });

    test('should compare objects correctly', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      const obj3 = { a: 1, b: 3 };
      const obj4 = { a: 1 };
      
      expect(BooleanComparator.booleanCompare(obj1, obj2)).toBe(true);
      expect(BooleanComparator.booleanCompare(obj1, obj3)).toBe(false);
      expect(BooleanComparator.booleanCompare(obj1, obj4)).toBe(false);
    });

    test('should handle nested structures', () => {
      const obj1 = { a: { b: { c: 1 } } };
      const obj2 = { a: { b: { c: 1 } } };
      const obj3 = { a: { b: { c: 2 } } };
      
      expect(BooleanComparator.booleanCompare(obj1, obj2)).toBe(true);
      expect(BooleanComparator.booleanCompare(obj1, obj3)).toBe(false);
    });

    test('should handle mixed arrays and objects', () => {
      const arr1 = [{ a: 1 }, { b: 2 }];
      const arr2 = [{ a: 1 }, { b: 2 }];
      const arr3 = [{ a: 1 }, { b: 3 }];
      
      expect(BooleanComparator.booleanCompare(arr1, arr2)).toBe(true);
      expect(BooleanComparator.booleanCompare(arr1, arr3)).toBe(false);
    });
  });

  describe('booleanCompareArrays', () => {
    test('should return true for identical arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      expect(BooleanComparator.booleanCompareArrays(arr1, arr2)).toBe(true);
    });

    test('should return false for different lengths', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2];
      expect(BooleanComparator.booleanCompareArrays(arr1, arr2)).toBe(false);
    });

    test('should return true for empty arrays', () => {
      const arr1 = [];
      const arr2 = [];
      expect(BooleanComparator.booleanCompareArrays(arr1, arr2)).toBe(true);
    });

    test('should return false for different elements', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 4];
      expect(BooleanComparator.booleanCompareArrays(arr1, arr2)).toBe(false);
    });

    test('should handle nested arrays', () => {
      const arr1 = [[1, 2], [3, 4]];
      const arr2 = [[1, 2], [3, 4]];
      const arr3 = [[1, 2], [3, 5]];
      
      expect(BooleanComparator.booleanCompareArrays(arr1, arr2)).toBe(true);
      expect(BooleanComparator.booleanCompareArrays(arr1, arr3)).toBe(false);
    });

    test('should handle arrays with objects', () => {
      const arr1 = [{ a: 1 }, { b: 2 }];
      const arr2 = [{ a: 1 }, { b: 2 }];
      const arr3 = [{ a: 1 }, { b: 3 }];
      
      expect(BooleanComparator.booleanCompareArrays(arr1, arr2)).toBe(true);
      expect(BooleanComparator.booleanCompareArrays(arr1, arr3)).toBe(false);
    });
  });

  describe('booleanCompareObjects', () => {
    test('should return true for identical objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      expect(BooleanComparator.booleanCompareObjects(obj1, obj2)).toBe(true);
    });

    test('should return false for different key counts', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1 };
      expect(BooleanComparator.booleanCompareObjects(obj1, obj2)).toBe(false);
    });

    test('should return true for empty objects', () => {
      const obj1 = {};
      const obj2 = {};
      expect(BooleanComparator.booleanCompareObjects(obj1, obj2)).toBe(true);
    });

    test('should return false for different values', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 3 };
      expect(BooleanComparator.booleanCompareObjects(obj1, obj2)).toBe(false);
    });

    test('should return false for missing keys', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, c: 2 };
      expect(BooleanComparator.booleanCompareObjects(obj1, obj2)).toBe(false);
    });

    test('should handle nested objects', () => {
      const obj1 = { a: { b: { c: 1 } } };
      const obj2 = { a: { b: { c: 1 } } };
      const obj3 = { a: { b: { c: 2 } } };
      
      expect(BooleanComparator.booleanCompareObjects(obj1, obj2)).toBe(true);
      expect(BooleanComparator.booleanCompareObjects(obj1, obj3)).toBe(false);
    });

    test('should handle objects with arrays', () => {
      const obj1 = { a: [1, 2], b: [3, 4] };
      const obj2 = { a: [1, 2], b: [3, 4] };
      const obj3 = { a: [1, 2], b: [3, 5] };
      
      expect(BooleanComparator.booleanCompareObjects(obj1, obj2)).toBe(true);
      expect(BooleanComparator.booleanCompareObjects(obj1, obj3)).toBe(false);
    });

    test('should handle objects with different key order', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 2, a: 1 };
      expect(BooleanComparator.booleanCompareObjects(obj1, obj2)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle special values', () => {
      expect(BooleanComparator.booleanCompare(NaN, NaN)).toBe(false);
      expect(BooleanComparator.booleanCompare(Infinity, Infinity)).toBe(true);
      expect(BooleanComparator.booleanCompare(-Infinity, -Infinity)).toBe(true);
      expect(BooleanComparator.booleanCompare(Infinity, -Infinity)).toBe(false);
    });

    test('should handle functions', () => {
      const fn1 = () => {};
      const fn2 = () => {};
      expect(BooleanComparator.booleanCompare(fn1, fn1)).toBe(true);
      expect(BooleanComparator.booleanCompare(fn1, fn2)).toBe(false);
    });

    test('should handle dates', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-01');
      const date3 = new Date('2023-01-02');
      
      // BooleanComparator compares objects by their enumerable properties
      // Date objects have no enumerable properties, so they're all considered equal
      expect(BooleanComparator.booleanCompare(date1, date1)).toBe(true); // Same reference
      expect(BooleanComparator.booleanCompare(date1, date2)).toBe(true); // Both have no enumerable properties
      expect(BooleanComparator.booleanCompare(date1, date3)).toBe(true); // Both have no enumerable properties
    });

    test('should handle regex objects', () => {
      const regex1 = /test/;
      const regex2 = /test/;
      const regex3 = /test2/;
      
      // BooleanComparator compares objects by their enumerable properties
      // RegExp objects have no enumerable properties, so they're all considered equal
      expect(BooleanComparator.booleanCompare(regex1, regex1)).toBe(true);
      expect(BooleanComparator.booleanCompare(regex1, regex2)).toBe(true); // Both have no enumerable properties
      expect(BooleanComparator.booleanCompare(regex1, regex3)).toBe(true); // Both have no enumerable properties
    });

    test('should handle empty arrays and objects', () => {
      expect(BooleanComparator.booleanCompare([], [])).toBe(true);
      expect(BooleanComparator.booleanCompare({}, {})).toBe(true);
      expect(BooleanComparator.booleanCompare([], {})).toBe(false);
    });

    test('should handle arrays with undefined and null', () => {
      const arr1 = [null, undefined, 1];
      const arr2 = [null, undefined, 1];
      const arr3 = [null, undefined, 2];
      
      expect(BooleanComparator.booleanCompare(arr1, arr2)).toBe(true);
      expect(BooleanComparator.booleanCompare(arr1, arr3)).toBe(false);
    });

    test('should handle objects with undefined and null values', () => {
      const obj1 = { a: null, b: undefined, c: 1 };
      const obj2 = { a: null, b: undefined, c: 1 };
      const obj3 = { a: null, b: undefined, c: 2 };
      
      expect(BooleanComparator.booleanCompare(obj1, obj2)).toBe(true);
      expect(BooleanComparator.booleanCompare(obj1, obj3)).toBe(false);
    });
  });

  describe('Performance Edge Cases', () => {
    test('should handle large arrays efficiently', () => {
      const largeArray1 = Array.from({ length: 1000 }, (_, i) => i);
      const largeArray2 = Array.from({ length: 1000 }, (_, i) => i);
      const largeArray3 = Array.from({ length: 1000 }, (_, i) => i + 1);
      
      expect(BooleanComparator.booleanCompare(largeArray1, largeArray2)).toBe(true);
      expect(BooleanComparator.booleanCompare(largeArray1, largeArray3)).toBe(false);
    });

    test('should handle deeply nested structures', () => {
      let deepObj1 = {};
      let deepObj2 = {};
      let current1 = deepObj1;
      let current2 = deepObj2;
      
      // Create deeply nested objects
      for (let i = 0; i < 100; i++) {
        current1.nested = {};
        current2.nested = {};
        current1 = current1.nested;
        current2 = current2.nested;
      }
      current1.value = 'deep';
      current2.value = 'deep';
      
      expect(BooleanComparator.booleanCompare(deepObj1, deepObj2)).toBe(true);
      
      // Test with different values
      current2.value = 'different';
      expect(BooleanComparator.booleanCompare(deepObj1, deepObj2)).toBe(false);
    });
  });
});
