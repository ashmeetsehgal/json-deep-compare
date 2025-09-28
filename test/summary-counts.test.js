/**
 * @fileoverview Tests for summary count accuracy - specifically addressing the hard-coded values issue
 * @author AshmeetSehgal.com
 * @description Tests to ensure UltraFastComparator provides accurate summary counts
 */

const UltraFastComparator = require('../src/UltraFastComparator');
const FastComparator = require('../src/FastComparator');

describe('Summary Count Accuracy Tests', () => {
  
  describe('UltraFastComparator - Addressing Hard-Coded Values Issue', () => {
    test('Should provide accurate counts for multi-key objects (was hard-coded to 1)', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 1, b: 2, c: 3 };
      
      const result = UltraFastComparator.ultraFastCompareWithResult(obj1, obj2);
      
      // This test would have failed with the old hard-coded implementation
      expect(result.summary.totalKeysCompared).toBe(3);
      expect(result.summary.totalMatched).toBe(3);
      expect(result.summary.totalUnmatched).toBe(0);
      expect(result.summary.matchPercentage).toBe(100);
    });

    test('Should provide accurate counts for non-matching multi-key objects', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 1, b: 2, c: 4 };
      
      const result = UltraFastComparator.ultraFastCompareWithResult(obj1, obj2);
      
      expect(result.summary.totalKeysCompared).toBe(3);
      expect(result.summary.totalMatched).toBe(2);
      expect(result.summary.totalUnmatched).toBe(1);
      expect(result.summary.matchPercentage).toBe(67);
    });

    test('Should provide accurate counts for arrays (was hard-coded to 1)', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [1, 2, 3, 4];
      
      const result = UltraFastComparator.ultraFastCompareWithResult(arr1, arr2);
      
      expect(result.summary.totalKeysCompared).toBe(4);
      expect(result.summary.totalMatched).toBe(4);
      expect(result.summary.totalUnmatched).toBe(0);
      expect(result.summary.matchPercentage).toBe(100);
    });

    test('Should provide accurate counts for nested objects (was hard-coded to 1)', () => {
      const obj1 = { a: 1, b: { x: 2, y: 3 }, c: 4 };
      const obj2 = { a: 1, b: { x: 2, y: 3 }, c: 4 };
      
      const result = UltraFastComparator.ultraFastCompareWithResult(obj1, obj2);
      
      expect(result.summary.totalKeysCompared).toBe(4);
      expect(result.summary.totalMatched).toBe(4);
      expect(result.summary.totalUnmatched).toBe(0);
      expect(result.summary.matchPercentage).toBe(100);
    });

    test('Should provide accurate counts for partially matching nested objects', () => {
      const obj1 = { a: 1, b: { x: 2, y: 3 }, c: 4 };
      const obj2 = { a: 1, b: { x: 2, y: 4 }, c: 4 };
      
      const result = UltraFastComparator.ultraFastCompareWithResult(obj1, obj2);
      
      expect(result.summary.totalKeysCompared).toBe(4);
      expect(result.summary.totalMatched).toBe(3);
      expect(result.summary.totalUnmatched).toBe(1);
      expect(result.summary.matchPercentage).toBe(75);
    });

    test('Should provide accurate counts for large multi-key objects', () => {
      const obj1 = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8 };
      const obj2 = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8 };
      
      const result = UltraFastComparator.ultraFastCompareWithResult(obj1, obj2);
      
      // This would have failed with hard-coded values (always returned 1)
      expect(result.summary.totalKeysCompared).toBe(8);
      expect(result.summary.totalMatched).toBe(8);
      expect(result.summary.totalUnmatched).toBe(0);
      expect(result.summary.matchPercentage).toBe(100);
    });

    test('Should provide accurate counts for large arrays', () => {
      const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const arr2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      
      const result = UltraFastComparator.ultraFastCompareWithResult(arr1, arr2);
      
      expect(result.summary.totalKeysCompared).toBe(10);
      expect(result.summary.totalMatched).toBe(10);
      expect(result.summary.totalUnmatched).toBe(0);
      expect(result.summary.matchPercentage).toBe(100);
    });
  });

  describe('FastComparator - Ensuring Consistency', () => {
    test('FastComparator should provide accurate counts for multi-key objects', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 1, b: 2, c: 3 };
      
      const result = FastComparator.fastCompare(obj1, obj2);
      
      expect(result.totalKeys).toBe(3);
      expect(result.matched).toBe(3);
      expect(result.unmatched).toBe(0);
      expect(result.matchPercentage).toBe(100);
    });

    test('FastComparator should provide accurate counts for partially matching objects', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 1, b: 2, c: 4 };
      
      const result = FastComparator.fastCompare(obj1, obj2);
      
      expect(result.totalKeys).toBe(3);
      expect(result.matched).toBe(2);
      expect(result.unmatched).toBe(1);
      expect(result.matchPercentage).toBe(66.66666666666666);
    });
  });

  describe('Regression Tests - Preventing Hard-Coded Values', () => {
    test('Should never return hard-coded count of 1 for multi-key objects', () => {
      const obj1 = { a: 1, b: 2, c: 3, d: 4, e: 5 };
      const obj2 = { a: 1, b: 2, c: 3, d: 4, e: 5 };
      
      const result = UltraFastComparator.ultraFastCompareWithResult(obj1, obj2);
      
      // This would have failed with the old hard-coded implementation
      expect(result.summary.totalKeysCompared).not.toBe(1);
      expect(result.summary.totalKeysCompared).toBe(5);
      expect(result.summary.totalMatched).toBe(5);
      expect(result.summary.totalUnmatched).toBe(0);
    });

    test('Should never return hard-coded count of 1 for non-matching multi-key objects', () => {
      const obj1 = { a: 1, b: 2, c: 3, d: 4, e: 5 };
      const obj2 = { a: 1, b: 2, c: 3, d: 4, e: 6 };
      
      const result = UltraFastComparator.ultraFastCompareWithResult(obj1, obj2);
      
      expect(result.summary.totalKeysCompared).not.toBe(1);
      expect(result.summary.totalKeysCompared).toBe(5);
      expect(result.summary.totalMatched).toBe(4);
      expect(result.summary.totalUnmatched).toBe(1);
    });

    test('Should never return hard-coded count of 1 for arrays', () => {
      const arr1 = [1, 2, 3, 4, 5];
      const arr2 = [1, 2, 3, 4, 5];
      
      const result = UltraFastComparator.ultraFastCompareWithResult(arr1, arr2);
      
      expect(result.summary.totalKeysCompared).not.toBe(1);
      expect(result.summary.totalKeysCompared).toBe(5);
      expect(result.summary.totalMatched).toBe(5);
      expect(result.summary.totalUnmatched).toBe(0);
    });
  });

  describe('Edge Case Tests', () => {
    test('Should handle empty objects correctly', () => {
      const obj1 = {};
      const obj2 = {};
      
      const result = UltraFastComparator.ultraFastCompareWithResult(obj1, obj2);
      
      expect(result.summary.totalKeysCompared).toBe(0);
      expect(result.summary.totalMatched).toBe(0);
      expect(result.summary.totalUnmatched).toBe(0);
      expect(result.summary.matchPercentage).toBe(100);
    });

    test('Should handle empty arrays correctly', () => {
      const arr1 = [];
      const arr2 = [];
      
      const result = UltraFastComparator.ultraFastCompareWithResult(arr1, arr2);
      
      expect(result.summary.totalKeysCompared).toBe(0);
      expect(result.summary.totalMatched).toBe(0);
      expect(result.summary.totalUnmatched).toBe(0);
      expect(result.summary.matchPercentage).toBe(100);
    });

    test('Should handle single-key objects correctly', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      
      const result = UltraFastComparator.ultraFastCompareWithResult(obj1, obj2);
      
      expect(result.summary.totalKeysCompared).toBe(1);
      expect(result.summary.totalMatched).toBe(1);
      expect(result.summary.totalUnmatched).toBe(0);
      expect(result.summary.matchPercentage).toBe(100);
    });

    test('Should handle single-element arrays correctly', () => {
      const arr1 = [1];
      const arr2 = [1];
      
      const result = UltraFastComparator.ultraFastCompareWithResult(arr1, arr2);
      
      expect(result.summary.totalKeysCompared).toBe(1);
      expect(result.summary.totalMatched).toBe(1);
      expect(result.summary.totalUnmatched).toBe(0);
      expect(result.summary.matchPercentage).toBe(100);
    });
  });

  describe('Count Consistency Tests', () => {
    test('Match percentage should be calculated correctly', () => {
      const obj1 = { a: 1, b: 2, c: 3, d: 4 };
      const obj2 = { a: 1, b: 2, c: 5, d: 6 };
      
      const result = UltraFastComparator.ultraFastCompareWithResult(obj1, obj2);
      
      const expectedPercentage = Math.round((result.summary.totalMatched / result.summary.totalKeysCompared) * 100);
      expect(result.summary.matchPercentage).toBe(expectedPercentage);
    });

    test('Total counts should be consistent', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 1, b: 2, c: 4 };
      
      const result = UltraFastComparator.ultraFastCompareWithResult(obj1, obj2);
      
      expect(result.summary.totalKeysCompared).toBe(
        result.summary.totalMatched + result.summary.totalUnmatched
      );
    });
  });
});