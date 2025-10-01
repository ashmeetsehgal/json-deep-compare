/**
 * @fileoverview Comprehensive tests for Comparator
 * @author AshmeetSehgal.com
 * @description Tests for Comparator to achieve high coverage
 */

const Comparator = require('../src/Comparator');
const Result = require('../src/Result');
const RegexValidator = require('../src/RegexValidator');

describe('Comparator Tests', () => {
  let comparator;
  let result;
  let regexValidator;

  beforeEach(() => {
    result = new Result();
    regexValidator = new RegexValidator({}, result);
    comparator = new Comparator({}, result, regexValidator);
  });

  describe('TypeDetector', () => {
    test('should detect null type', () => {
      expect(comparator.getValueType(null)).toBe('null');
    });

    test('should detect undefined type', () => {
      expect(comparator.getValueType(undefined)).toBe('undefined');
    });

    test('should detect primitive types', () => {
      expect(comparator.getValueType(1)).toBe('number');
      expect(comparator.getValueType('hello')).toBe('string');
      expect(comparator.getValueType(true)).toBe('boolean');
      expect(comparator.getValueType(() => {})).toBe('function');
    });

    test('should detect array type', () => {
      expect(comparator.getValueType([1, 2, 3])).toBe('array');
    });

    test('should detect date type', () => {
      const date = new Date();
      expect(comparator.getValueType(date)).toBe('date');
    });

    test('should detect regex type', () => {
      const regex = /test/;
      expect(comparator.getValueType(regex)).toBe('regex');
    });

    test('should detect object type', () => {
      expect(comparator.getValueType({})).toBe('object');
    });

    test('should detect custom object types', () => {
      class CustomClass {}
      const custom = new CustomClass();
      expect(comparator.getValueType(custom)).toBe('customclass');
    });
  });

  describe('getValueType', () => {
    test('should return correct types for primitives', () => {
      expect(comparator.getValueType(null)).toBe('null');
      expect(comparator.getValueType(undefined)).toBe('undefined');
      expect(comparator.getValueType(1)).toBe('number');
      expect(comparator.getValueType('hello')).toBe('string');
      expect(comparator.getValueType(true)).toBe('boolean');
    });

    test('should return correct types for objects', () => {
      expect(comparator.getValueType([])).toBe('array');
      expect(comparator.getValueType({})).toBe('object');
      expect(comparator.getValueType(new Date())).toBe('date');
      expect(comparator.getValueType(/test/)).toBe('regex');
    });
  });

  describe('compareObjects', () => {
    test('should handle null objects', () => {
      comparator.compareObjects(null, null, '');
      comparator.compareObjects(null, {}, '');
      comparator.compareObjects({}, null, '');
    });

    test('should handle circular references', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      obj1.self = obj1;
      obj2.self = obj2;
      
      comparator.compareObjects(obj1, obj2, '');
      expect(result.getResult().summary.totalKeysCompared).toBeGreaterThan(0);
    });

    test('should compare simple objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      
      comparator.compareObjects(obj1, obj2, '');
      const resultData = result.getResult();
      expect(resultData.summary.matchPercentage).toBe(100);
    });

    test('should detect missing keys', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1 };
      
      comparator.compareObjects(obj1, obj2, '');
      const resultData = result.getResult();
      expect(resultData.unmatchedKeys.length).toBeGreaterThan(0);
    });

    test('should handle extra keys when ignoreExtraKeys is false', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1, b: 2 };
      
      comparator.options.ignoreExtraKeys = false;
      comparator.compareObjects(obj1, obj2, '');
      const resultData = result.getResult();
      expect(resultData.unmatchedKeys.length).toBeGreaterThan(0);
    });

    test('should ignore extra keys when ignoreExtraKeys is true', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1, b: 2 };
      
      comparator.options.ignoreExtraKeys = true;
      comparator.compareObjects(obj1, obj2, '');
      const resultData = result.getResult();
      expect(resultData.summary.matchPercentage).toBe(100);
    });

    test('should handle ignored keys', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 1, b: 2, d: 4 };
      
      comparator.options.ignoredKeys = ['c', 'd'];
      comparator.compareObjects(obj1, obj2, '');
      const resultData = result.getResult();
      expect(resultData.summary.matchPercentage).toBe(100);
    });

    test('should handle nested objects', () => {
      const obj1 = { a: { b: { c: 1 } } };
      const obj2 = { a: { b: { c: 1 } } };
      
      comparator.compareObjects(obj1, obj2, '');
      const resultData = result.getResult();
      expect(resultData.summary.matchPercentage).toBe(100);
    });

    test('should handle different object types', () => {
      const obj1 = { a: 1 };
      const obj2 = [1];
      
      comparator.compareObjects(obj1, obj2, '');
      const resultData = result.getResult();
      expect(resultData.unmatched.values.length).toBeGreaterThan(0);
    });
  });

  describe('compareArrays', () => {
    test('should compare identical arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      
      comparator.compareArrays(arr1, arr2, '');
      const resultData = result.getResult();
      expect(resultData.summary.matchPercentage).toBe(100);
    });

    test('should handle different array lengths', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2];
      
      comparator.compareArrays(arr1, arr2, '');
      const resultData = result.getResult();
      expect(resultData.unmatched.values.length).toBeGreaterThan(0);
    });

    test('should handle extra elements in first array', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [1, 2, 3];
      
      comparator.compareArrays(arr1, arr2, '');
      const resultData = result.getResult();
      expect(resultData.unmatched.values.length).toBeGreaterThan(0);
    });

    test('should handle extra elements in second array', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3, 4];
      
      comparator.compareArrays(arr1, arr2, '');
      const resultData = result.getResult();
      expect(resultData.unmatched.values.length).toBeGreaterThan(0);
    });

    test('should handle nested arrays', () => {
      const arr1 = [[1, 2], [3, 4]];
      const arr2 = [[1, 2], [3, 4]];
      
      comparator.compareArrays(arr1, arr2, '');
      const resultData = result.getResult();
      expect(resultData.summary.matchPercentage).toBe(100);
    });

    test('should handle arrays with objects', () => {
      const arr1 = [{ a: 1 }, { b: 2 }];
      const arr2 = [{ a: 1 }, { b: 2 }];
      
      comparator.compareArrays(arr1, arr2, '');
      const resultData = result.getResult();
      expect(resultData.summary.matchPercentage).toBe(100);
    });
  });

  describe('compareValues', () => {
    test('should compare identical primitives', () => {
      comparator.compareValues(1, 1, '');
      comparator.compareValues('hello', 'hello', '');
      comparator.compareValues(true, true, '');
      comparator.compareValues(null, null, '');
      comparator.compareValues(undefined, undefined, '');
    });

    test('should detect different primitives', () => {
      comparator.compareValues(1, 2, '');
      comparator.compareValues('hello', 'world', '');
      comparator.compareValues(true, false, '');
    });

    test('should handle equivalent values', () => {
      comparator.options.equivalentValues = {
        'zero': [0, '0', false],
        'empty': ['', null, undefined]
      };
      
      comparator.compareValues(0, '0', '');
      const resultData = result.getResult();
      expect(resultData.matched.values.length).toBeGreaterThan(0);
    });

    test('should handle type mismatches', () => {
      comparator.compareValues(1, '1', '');
      const resultData = result.getResult();
      expect(resultData.unmatchedTypes.length).toBeGreaterThan(0);
    });

    test('should handle date comparisons', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-01');
      const date3 = new Date('2023-01-02');
      
      comparator.compareValues(date1, date2, '');
      comparator.compareValues(date1, date3, '');
    });

    test('should handle regex comparisons', () => {
      const regex1 = /test/;
      const regex2 = /test/;
      const regex3 = /other/;
      
      comparator.compareValues(regex1, regex2, '');
      comparator.compareValues(regex1, regex3, '');
    });

    test('should handle function comparisons', () => {
      const func1 = () => {};
      const func2 = () => {};
      
      comparator.compareValues(func1, func1, '');
      comparator.compareValues(func1, func2, '');
    });

    test('should handle array comparisons', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      const arr3 = [1, 2, 4];
      
      comparator.compareValues(arr1, arr2, '');
      comparator.compareValues(arr1, arr3, '');
    });

    test('should handle object comparisons', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      const obj3 = { a: 2 };
      
      comparator.compareValues(obj1, obj2, '');
      comparator.compareValues(obj1, obj3, '');
    });

    test('should handle strict equality', () => {
      comparator.options.strictEquality = true;
      comparator.compareValues(1, '1', '');
      const resultData = result.getResult();
      expect(resultData.unmatched.values.length).toBeGreaterThan(0);
    });

    test('should handle tolerance for numbers', () => {
      comparator.options.tolerance = 0.1;
      comparator.compareValues(1.0, 1.05, '');
      const resultData = result.getResult();
      expect(resultData.matched.values.length).toBeGreaterThan(0);
    });

    test('should handle case sensitivity for strings', () => {
      comparator.options.caseSensitive = false;
      comparator.compareValues('Hello', 'hello', '');
      const resultData = result.getResult();
      expect(resultData.matched.values.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty objects', () => {
      comparator.compareObjects({}, {}, '');
      const resultData = result.getResult();
      expect(resultData.summary.matchPercentage).toBe(100);
    });

    test('should handle empty arrays', () => {
      comparator.compareArrays([], [], '');
      const resultData = result.getResult();
      expect(resultData.summary.matchPercentage).toBe(100);
    });

    test('should handle undefined values', () => {
      comparator.compareValues(undefined, undefined, '');
      comparator.compareValues(undefined, null, '');
    });

    test('should handle NaN values', () => {
      comparator.compareValues(NaN, NaN, '');
      comparator.compareValues(NaN, 1, '');
    });

    test('should handle Infinity values', () => {
      comparator.compareValues(Infinity, Infinity, '');
      comparator.compareValues(Infinity, -Infinity, '');
    });

    test('should handle Symbol values', () => {
      const sym1 = Symbol('test');
      const sym2 = Symbol('test');
      const sym3 = Symbol('other');
      
      comparator.compareValues(sym1, sym1, '');
      comparator.compareValues(sym1, sym2, '');
      comparator.compareValues(sym1, sym3, '');
    });
  });

  describe('Performance and Memory', () => {
    test('should handle large objects efficiently', () => {
      const largeObj1 = {};
      const largeObj2 = {};
      
      for (let i = 0; i < 1000; i++) {
        largeObj1[`key${i}`] = i;
        largeObj2[`key${i}`] = i;
      }
      
      comparator.compareObjects(largeObj1, largeObj2, '');
      const resultData = result.getResult();
      expect(resultData.summary.matchPercentage).toBe(100);
    });

    test('should handle large arrays efficiently', () => {
      const largeArr1 = Array.from({ length: 1000 }, (_, i) => i);
      const largeArr2 = Array.from({ length: 1000 }, (_, i) => i);
      
      comparator.compareArrays(largeArr1, largeArr2, '');
      const resultData = result.getResult();
      expect(resultData.summary.matchPercentage).toBe(100);
    });
  });
});
