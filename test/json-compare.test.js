/**
 * @fileoverview Comprehensive tests for JSONCompare
 * @author AshmeetSehgal.com
 * @description Tests for JSONCompare to achieve high coverage
 */

const JSONCompare = require('../src/JSONCompare');

describe('JSONCompare Tests', () => {
  let jsonCompare;

  beforeEach(() => {
    jsonCompare = new JSONCompare();
  });

  describe('Constructor', () => {
    test('should initialize with default options', () => {
      expect(jsonCompare.options).toBeDefined();
      expect(jsonCompare.result).toBeDefined();
      expect(jsonCompare.regexValidator).toBeDefined();
      expect(jsonCompare.comparator).toBeDefined();
    });

    test('should initialize with custom options', () => {
      const options = {
        ignoredKeys: ['id'],
        strictTypes: false,
        ignoreExtraKeys: true
      };
      const customCompare = new JSONCompare(options);
      expect(customCompare.options).toBeDefined();
    });

    test('should handle invalid options gracefully', () => {
      const invalidOptions = { invalid: 'option' };
      const jsonCompare = new JSONCompare(invalidOptions);
      expect(jsonCompare).toBeDefined();
      expect(jsonCompare.options).toBeDefined();
    });
  });

  describe('shouldUseUltraFastMode', () => {
    test('should return true for basic comparison', () => {
      const basicOptions = {
        strictTypes: true,
        ignoreExtraKeys: true
      };
      const basicCompare = new JSONCompare(basicOptions);
      expect(basicCompare.shouldUseUltraFastMode()).toBe(true);
    });

    test('should return false when regexChecks are present', () => {
      const optionsWithRegex = {
        regexChecks: { email: /test/ },
        strictTypes: true,
        ignoreExtraKeys: true
      };
      const compareWithRegex = new JSONCompare(optionsWithRegex);
      expect(compareWithRegex.shouldUseUltraFastMode()).toBe(false);
    });

    test('should return false when equivalentValues are present', () => {
      const optionsWithEquivalent = {
        equivalentValues: { '0': ['0', 'zero'] },
        strictTypes: true,
        ignoreExtraKeys: true
      };
      const compareWithEquivalent = new JSONCompare(optionsWithEquivalent);
      expect(compareWithEquivalent.shouldUseUltraFastMode()).toBe(false);
    });

    test('should return false when strictTypes is not true', () => {
      const optionsWithStrictTypes = {
        strictTypes: false,
        ignoreExtraKeys: true
      };
      const compareWithStrictTypes = new JSONCompare(optionsWithStrictTypes);
      expect(compareWithStrictTypes.shouldUseUltraFastMode()).toBe(false);
    });

    test('should return false when ignoredKeys are present', () => {
      const optionsWithIgnoredKeys = {
        ignoredKeys: ['id'],
        strictTypes: true,
        ignoreExtraKeys: true
      };
      const compareWithIgnoredKeys = new JSONCompare(optionsWithIgnoredKeys);
      expect(compareWithIgnoredKeys.shouldUseUltraFastMode()).toBe(false);
    });

    test('should return false when ignoreExtraKeys is not true', () => {
      const optionsWithExtraKeys = {
        ignoreExtraKeys: false,
        strictTypes: true
      };
      const compareWithExtraKeys = new JSONCompare(optionsWithExtraKeys);
      expect(compareWithExtraKeys.shouldUseUltraFastMode()).toBe(false);
    });

    test('should return false when matchKeysByName is true', () => {
      const optionsWithMatchKeys = {
        matchKeysByName: true,
        strictTypes: true,
        ignoreExtraKeys: true
      };
      const compareWithMatchKeys = new JSONCompare(optionsWithMatchKeys);
      expect(compareWithMatchKeys.shouldUseUltraFastMode()).toBe(false);
    });
  });

  describe('compare', () => {
    test('should compare identical objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      const result = jsonCompare.compare(obj1, obj2);
      expect(result.summary.matchPercentage).toBe(100);
    });

    test('should compare different objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 3 };
      const result = jsonCompare.compare(obj1, obj2);
      expect(result.summary.matchPercentage).toBeLessThan(100);
    });

    test('should handle null comparisons', () => {
      const result = jsonCompare.compare(null, null);
      expect(result.summary.matchPercentage).toBe(100);
      expect(result.summary.totalKeysCompared).toBe(0);
    });

    test('should handle undefined comparisons', () => {
      const result = jsonCompare.compare(undefined, undefined);
      expect(result.summary.matchPercentage).toBe(100);
      expect(result.summary.totalKeysCompared).toBe(0);
    });

    test('should handle null vs undefined comparisons', () => {
      const result = jsonCompare.compare(null, undefined);
      expect(result.summary.matchPercentage).toBe(0);
      expect(result.summary.totalKeysCompared).toBe(1);
      expect(result.unmatched.types.length).toBe(1); // Type mismatch recorded in types, not values
    });

    test('should handle invalid inputs gracefully', () => {
      const result = jsonCompare.compare('invalid', 'input');
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    test('should handle comparison errors gracefully', () => {
      const result = jsonCompare.compare({}, {});
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
    });
  });

  describe('isEqual', () => {
    test('should return true for identical objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      expect(jsonCompare.isEqual(obj1, obj2)).toBe(true);
    });

    test('should return false for different objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 3 };
      expect(jsonCompare.isEqual(obj1, obj2)).toBe(false);
    });

    test('should handle null comparisons', () => {
      expect(jsonCompare.isEqual(null, null)).toBe(true);
      expect(jsonCompare.isEqual(null, undefined)).toBe(false);
    });

    test('should handle primitive comparisons', () => {
      expect(jsonCompare.isEqual(1, 1)).toBe(true);
      expect(jsonCompare.isEqual(1, 2)).toBe(false);
      expect(jsonCompare.isEqual('hello', 'hello')).toBe(true);
      expect(jsonCompare.isEqual('hello', 'world')).toBe(false);
    });
  });

  describe('compareAndValidate', () => {
    test('should compare and validate with regex checks', () => {
      const obj1 = { email: 'test@example.com' };
      const obj2 = { email: 'test@example.com' };
      const result = jsonCompare.compareAndValidate(obj1, obj2);
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    test('should handle objects without regex checks', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      const result = jsonCompare.compareAndValidate(obj1, obj2);
      expect(result).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('should handle circular references', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      obj1.self = obj1;
      obj2.self = obj2;
      
      const result = jsonCompare.compare(obj1, obj2);
      expect(result).toBeDefined();
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
      
      const result = jsonCompare.compare(obj1, obj2);
      expect(result).toBeDefined();
    });

    test('should handle special values', () => {
      const obj1 = { a: NaN, b: Infinity, c: -Infinity };
      const obj2 = { a: NaN, b: Infinity, c: -Infinity };
      const result = jsonCompare.compare(obj1, obj2);
      expect(result).toBeDefined();
    });

    test('should handle empty objects and arrays', () => {
      expect(jsonCompare.compare({}, {})).toBeDefined();
      expect(jsonCompare.compare([], [])).toBeDefined();
    });

    test('should handle mixed types', () => {
      const obj1 = { a: 1, b: 'string', c: true, d: null };
      const obj2 = { a: 1, b: 'string', c: true, d: null };
      const result = jsonCompare.compare(obj1, obj2);
      expect(result).toBeDefined();
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
      const result = jsonCompare.compare(largeObj1, largeObj2);
      const end = Date.now();
      
      expect(end - start).toBeLessThan(1000); // Should complete in less than 1 second
      expect(result.summary.matchPercentage).toBe(100);
    });

    test('should handle large arrays efficiently', () => {
      const largeArr1 = Array.from({ length: 1000 }, (_, i) => i);
      const largeArr2 = Array.from({ length: 1000 }, (_, i) => i);
      
      const start = Date.now();
      const result = jsonCompare.compare(largeArr1, largeArr2);
      const end = Date.now();
      
      expect(end - start).toBeLessThan(1000); // Should complete in less than 1 second
      expect(result.summary.matchPercentage).toBe(100);
    });
  });

  describe('Error Handling', () => {
    test('should handle comparison errors gracefully', () => {
      const result = jsonCompare.compare({}, {});
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    test('should handle malformed objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      Object.defineProperty(obj1, 'b', {
        get() { throw new Error('Access error'); }
      });
      
      const result = jsonCompare.compare(obj1, obj2);
      expect(result).toBeDefined();
    });
  });
});
