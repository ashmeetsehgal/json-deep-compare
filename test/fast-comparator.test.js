/**
 * @fileoverview Comprehensive tests for FastComparator
 * @author AshmeetSehgal.com
 * @description Tests for FastComparator to achieve high coverage
 */

const FastComparator = require('../src/FastComparator');

describe('FastComparator Tests', () => {
  describe('Static Methods', () => {

    describe('fastCompare', () => {
      test('should return success for identical primitives', () => {
        const result1 = FastComparator.fastCompare(1, 1);
        expect(result1.matchPercentage).toBe(100);
        
        const result2 = FastComparator.fastCompare('hello', 'hello');
        expect(result2.matchPercentage).toBe(100);
        
        const result3 = FastComparator.fastCompare(true, true);
        expect(result3.matchPercentage).toBe(100);
        
        const result4 = FastComparator.fastCompare(null, null);
        expect(result4.matchPercentage).toBe(100);
        
        const result5 = FastComparator.fastCompare(undefined, undefined);
        expect(result5.matchPercentage).toBe(100);
      });

      test('should return failure for different primitives', () => {
        const result1 = FastComparator.fastCompare(1, 2);
        expect(result1.matchPercentage).toBe(0);
        
        const result2 = FastComparator.fastCompare('hello', 'world');
        expect(result2.matchPercentage).toBe(0);
        
        const result3 = FastComparator.fastCompare(true, false);
        expect(result3.matchPercentage).toBe(0);
        
        const result4 = FastComparator.fastCompare(null, undefined);
        expect(result4.matchPercentage).toBe(0);
      });

      test('should return success for same reference', () => {
        const obj = { a: 1 };
        const result = FastComparator.fastCompare(obj, obj);
        expect(result.matchPercentage).toBe(100);
      });

      test('should return success for identical content (different references)', () => {
        const obj1 = { a: 1 };
        const obj2 = { a: 1 };
        const result = FastComparator.fastCompare(obj1, obj2);
        expect(result.matchPercentage).toBe(100); // Content comparison, not reference
      });

      test('should handle NaN values', () => {
        const result1 = FastComparator.fastCompare(NaN, NaN);
        expect(result1.matchPercentage).toBe(100);
        
        const result2 = FastComparator.fastCompare(NaN, 1);
        expect(result2.matchPercentage).toBe(0);
      });

      test('should handle Infinity values', () => {
        const result1 = FastComparator.fastCompare(Infinity, Infinity);
        expect(result1.matchPercentage).toBe(100);
        
        const result2 = FastComparator.fastCompare(Infinity, -Infinity);
        expect(result2.matchPercentage).toBe(0);
      });

      test('should handle zero values', () => {
        const result1 = FastComparator.fastCompare(0, 0);
        expect(result1.matchPercentage).toBe(100);
        
        const result2 = FastComparator.fastCompare(0, -0);
        expect(result2.matchPercentage).toBe(100);
        
        const result3 = FastComparator.fastCompare(-0, 0);
        expect(result3.matchPercentage).toBe(100);
      });
    });

    describe('fastCompareObjects', () => {
      test('should compare identical objects', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { a: 1, b: 2 };
        
        const result = FastComparator.fastCompareObjects(obj1, obj2);
        expect(result.matchPercentage).toBe(100);
      });

      test('should detect different values', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { a: 1, b: 3 };
        
        const result = FastComparator.fastCompareObjects(obj1, obj2);
        expect(result.matchPercentage).toBeLessThan(100);
      });

      test('should detect missing keys', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { a: 1 };
        
        const result = FastComparator.fastCompareObjects(obj1, obj2);
        expect(result.matchPercentage).toBeLessThan(100);
      });

      test('should detect extra keys', () => {
        const obj1 = { a: 1 };
        const obj2 = { a: 1, b: 2 };
        
        const result = FastComparator.fastCompareObjects(obj1, obj2);
        expect(result.matchPercentage).toBeLessThan(100);
      });

      test('should handle nested objects', () => {
        const obj1 = { a: { b: { c: 1 } } };
        const obj2 = { a: { b: { c: 1 } } };
        
        const result = FastComparator.fastCompareObjects(obj1, obj2);
        expect(result.matchPercentage).toBe(100);
      });

      test('should handle arrays in objects', () => {
        const obj1 = { a: [1, 2, 3] };
        const obj2 = { a: [1, 2, 3] };
        
        const result = FastComparator.fastCompareObjects(obj1, obj2);
        expect(result.matchPercentage).toBe(100);
      });

      test('should handle empty objects', () => {
        const result = FastComparator.fastCompareObjects({}, {});
        expect(result.matchPercentage).toBe(100);
      });
    });

    describe('fastCompareArrays', () => {
      test('should compare identical arrays', () => {
        const arr1 = [1, 2, 3];
        const arr2 = [1, 2, 3];
        
        const result = FastComparator.fastCompareArrays(arr1, arr2);
        expect(result.matchPercentage).toBe(100);
      });

      test('should detect different values', () => {
        const arr1 = [1, 2, 3];
        const arr2 = [1, 2, 4];
        
        const result = FastComparator.fastCompareArrays(arr1, arr2);
        expect(result.matchPercentage).toBeLessThan(100);
      });

      test('should detect different lengths', () => {
        const arr1 = [1, 2, 3];
        const arr2 = [1, 2];
        
        const result = FastComparator.fastCompareArrays(arr1, arr2);
        expect(result.matchPercentage).toBe(0);
      });

      test('should handle nested arrays', () => {
        const arr1 = [[1, 2], [3, 4]];
        const arr2 = [[1, 2], [3, 4]];
        
        const result = FastComparator.fastCompareArrays(arr1, arr2);
        expect(result.matchPercentage).toBe(100);
      });

      test('should handle arrays with objects', () => {
        const arr1 = [{ a: 1 }, { b: 2 }];
        const arr2 = [{ a: 1 }, { b: 2 }];
        
        const result = FastComparator.fastCompareArrays(arr1, arr2);
        expect(result.matchPercentage).toBe(100);
      });

      test('should handle empty arrays', () => {
        const result = FastComparator.fastCompareArrays([], []);
        expect(result.matchPercentage).toBe(100);
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
        const result = FastComparator.fastCompareObjects(largeObj1, largeObj2);
        const end = Date.now();
        
        expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
        expect(result.matchPercentage).toBe(100);
      });

      test('should handle large arrays efficiently', () => {
        const largeArr1 = Array.from({ length: 1000 }, (_, i) => i);
        const largeArr2 = Array.from({ length: 1000 }, (_, i) => i);
        
        const start = Date.now();
        const result = FastComparator.fastCompareArrays(largeArr1, largeArr2);
        const end = Date.now();
        
        expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
        expect(result.matchPercentage).toBe(100);
      });

      test('should handle many small comparisons efficiently', () => {
        const start = Date.now();
        
        for (let i = 0; i < 10000; i++) {
          FastComparator.fastCompare(i, i);
        }
        
        const end = Date.now();
        expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
      });
    });
  });
});
