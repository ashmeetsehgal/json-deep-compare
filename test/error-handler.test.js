/**
 * @fileoverview Comprehensive tests for ErrorHandler
 * @author AshmeetSehgal.com
 * @description Tests for ErrorHandler to achieve high coverage and reliability
 */

const ErrorHandler = require('../src/ErrorHandler');

describe('ErrorHandler Tests', () => {
  describe('safeExecute', () => {
    test('should execute function successfully', () => {
      const result = ErrorHandler.safeExecute(() => 'success', 'test');
      expect(result).toBe('success');
    });

    test('should return fallback on error', () => {
      const result = ErrorHandler.safeExecute(() => { throw new Error('test error'); }, 'test', 'fallback');
      expect(result).toBe('fallback');
    });

    test('should use default fallback', () => {
      const result = ErrorHandler.safeExecute(() => { throw new Error('test error'); }, 'test');
      expect(result).toBeNull();
    });
  });

  describe('validateInputs', () => {
    test('should validate null comparison', () => {
      const result = ErrorHandler.validateInputs(null, null);
      expect(result.isValid).toBe(true);
      expect(result.isNullComparison).toBe(true);
    });

    test('should validate undefined comparison', () => {
      const result = ErrorHandler.validateInputs(undefined, undefined);
      expect(result.isValid).toBe(true);
      expect(result.isUndefinedComparison).toBe(true);
    });

    test('should validate null vs undefined', () => {
      const result = ErrorHandler.validateInputs(null, undefined);
      expect(result.isValid).toBe(true);
      expect(result.isNullUndefinedComparison).toBe(true);
    });

    test('should validate undefined vs null', () => {
      const result = ErrorHandler.validateInputs(undefined, null);
      expect(result.isValid).toBe(true);
      expect(result.isNullUndefinedComparison).toBe(true);
    });

    test('should validate normal objects', () => {
      const result = ErrorHandler.validateInputs({ a: 1 }, { b: 2 });
      expect(result.isValid).toBe(true);
    });

    test('should detect circular references', () => {
      const obj = { a: 1 };
      obj.self = obj;
      
      const result = ErrorHandler.validateInputs(obj, { b: 2 });
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Circular reference detected in input objects');
    });
  });

  describe('hasCircularReference', () => {
    test('should return false for primitives', () => {
      expect(ErrorHandler.hasCircularReference(null)).toBe(false);
      expect(ErrorHandler.hasCircularReference(undefined)).toBe(false);
      expect(ErrorHandler.hasCircularReference(1)).toBe(false);
      expect(ErrorHandler.hasCircularReference('string')).toBe(false);
      expect(ErrorHandler.hasCircularReference(true)).toBe(false);
    });

    test('should return false for simple objects', () => {
      expect(ErrorHandler.hasCircularReference({})).toBe(false);
      expect(ErrorHandler.hasCircularReference({ a: 1, b: 2 })).toBe(false);
      expect(ErrorHandler.hasCircularReference([])).toBe(false);
      expect(ErrorHandler.hasCircularReference([1, 2, 3])).toBe(false);
    });

    test('should detect circular references', () => {
      const obj = { a: 1 };
      obj.self = obj;
      expect(ErrorHandler.hasCircularReference(obj)).toBe(true);
    });

    test('should detect circular references in arrays', () => {
      const arr = [1, 2];
      arr.push(arr);
      expect(ErrorHandler.hasCircularReference(arr)).toBe(true);
    });

    test('should detect nested circular references', () => {
      const obj = { a: { b: { c: {} } } };
      obj.a.b.c.self = obj;
      expect(ErrorHandler.hasCircularReference(obj)).toBe(true);
    });

    test('should handle objects that throw on access', () => {
      const obj = {};
      Object.defineProperty(obj, 'problematic', {
        get() { throw new Error('Cannot access'); },
        enumerable: true
      });
      
      // The hasCircularReference method should handle this gracefully
      expect(() => ErrorHandler.hasCircularReference(obj)).not.toThrow();
    });
  });

  describe('safeGetKeys', () => {
    test('should get keys from normal objects', () => {
      const result = ErrorHandler.safeGetKeys({ a: 1, b: 2 });
      expect(result).toEqual(['a', 'b']);
    });

    test('should return empty array for null/undefined', () => {
      expect(ErrorHandler.safeGetKeys(null)).toEqual([]);
      expect(ErrorHandler.safeGetKeys(undefined)).toEqual([]);
    });

    test('should handle objects that throw on keys access', () => {
      const obj = {};
      Object.defineProperty(obj, Symbol.toStringTag, {
        get() { throw new Error('Cannot access'); }
      });
      
      const result = ErrorHandler.safeGetKeys(obj);
      expect(result).toEqual([]);
    });
  });

  describe('safeGetValues', () => {
    test('should get values from normal objects', () => {
      const result = ErrorHandler.safeGetValues({ a: 1, b: 2 });
      expect(result).toEqual([1, 2]);
    });

    test('should return empty array for null/undefined', () => {
      expect(ErrorHandler.safeGetValues(null)).toEqual([]);
      expect(ErrorHandler.safeGetValues(undefined)).toEqual([]);
    });
  });

  describe('safeHasProperty', () => {
    test('should check properties on normal objects', () => {
      const obj = { a: 1, b: 2 };
      expect(ErrorHandler.safeHasProperty(obj, 'a')).toBe(true);
      expect(ErrorHandler.safeHasProperty(obj, 'c')).toBe(false);
    });

    test('should return false for null/undefined', () => {
      expect(ErrorHandler.safeHasProperty(null, 'a')).toBe(false);
      expect(ErrorHandler.safeHasProperty(undefined, 'a')).toBe(false);
    });
  });

  describe('safeGetProperty', () => {
    test('should get properties from normal objects', () => {
      const obj = { a: 1, b: 2 };
      expect(ErrorHandler.safeGetProperty(obj, 'a')).toBe(1);
      expect(ErrorHandler.safeGetProperty(obj, 'c')).toBeUndefined();
      expect(ErrorHandler.safeGetProperty(obj, 'c', 'default')).toBe('default');
    });

    test('should return default for null/undefined', () => {
      expect(ErrorHandler.safeGetProperty(null, 'a', 'default')).toBe('default');
      expect(ErrorHandler.safeGetProperty(undefined, 'a', 'default')).toBe('default');
    });
  });

  describe('safeGetLength', () => {
    test('should get length from arrays', () => {
      expect(ErrorHandler.safeGetLength([1, 2, 3])).toBe(3);
      expect(ErrorHandler.safeGetLength([])).toBe(0);
    });

    test('should return 0 for non-arrays', () => {
      expect(ErrorHandler.safeGetLength({})).toBe(0);
      expect(ErrorHandler.safeGetLength(null)).toBe(0);
      expect(ErrorHandler.safeGetLength(undefined)).toBe(0);
    });
  });

  describe('safeCompare', () => {
    test('should compare values with strict equality', () => {
      expect(ErrorHandler.safeCompare(1, 1, true)).toBe(true);
      expect(ErrorHandler.safeCompare(1, '1', true)).toBe(false);
    });

    test('should compare values with loose equality', () => {
      expect(ErrorHandler.safeCompare(1, 1, false)).toBe(true);
      expect(ErrorHandler.safeCompare(1, '1', false)).toBe(true);
    });

    test('should handle comparison errors', () => {
      const obj1 = {};
      const obj2 = {};
      Object.defineProperty(obj1, 'valueOf', {
        value() { throw new Error('Cannot compare'); }
      });
      
      expect(ErrorHandler.safeCompare(obj1, obj2)).toBe(false);
    });
  });

  describe('safeGetType', () => {
    test('should get types correctly', () => {
      expect(ErrorHandler.safeGetType(null)).toBe('null');
      expect(ErrorHandler.safeGetType(undefined)).toBe('undefined');
      expect(ErrorHandler.safeGetType(1)).toBe('number');
      expect(ErrorHandler.safeGetType('string')).toBe('string');
      expect(ErrorHandler.safeGetType(true)).toBe('boolean');
      expect(ErrorHandler.safeGetType({})).toBe('object');
      expect(ErrorHandler.safeGetType([])).toBe('object');
    });
  });

  describe('createSafeComparison', () => {
    test('should create safe comparison function', () => {
      const safeCompare = ErrorHandler.createSafeComparison(
        (a, b) => a === b,
        'test',
        false
      );
      
      expect(safeCompare(1, 1)).toBe(true);
      expect(safeCompare(1, 2)).toBe(false);
    });

    test('should handle errors in comparison function', () => {
      const safeCompare = ErrorHandler.createSafeComparison(
        () => { throw new Error('Comparison failed'); },
        'test',
        false
      );
      
      expect(safeCompare(1, 2)).toBe(false);
    });
  });

  describe('validateOptions', () => {
    test('should validate valid options', () => {
      const options = {
        ignoredKeys: ['key1', 'key2'],
        equivalentValues: { group1: [1, '1'] },
        strictTypes: true,
        ignoreExtraKeys: false,
        matchKeysByName: true
      };
      
      const result = ErrorHandler.validateOptions(options);
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toEqual(options);
    });

    test('should handle invalid options', () => {
      const options = {
        ignoredKeys: 'not an array',
        equivalentValues: 'not an object',
        strictTypes: 'not a boolean'
      };
      
      const result = ErrorHandler.validateOptions(options);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should sanitize invalid options', () => {
      const options = {
        ignoredKeys: ['key1', 123, 'key2'], // Mixed types
        equivalentValues: { group1: [1, '1'] },
        strictTypes: 'true', // String instead of boolean
        ignoreExtraKeys: null // Null instead of boolean
      };
      
      const result = ErrorHandler.validateOptions(options);
      expect(result.sanitized.ignoredKeys).toEqual(['key1', 'key2']); // Filtered
      expect(result.sanitized.strictTypes).toBe(true); // Default value
      expect(result.sanitized.ignoreExtraKeys).toBe(false); // Default value
    });

    test('should handle null/undefined options', () => {
      const result1 = ErrorHandler.validateOptions(null);
      const result2 = ErrorHandler.validateOptions(undefined);
      
      expect(result1.isValid).toBe(false);
      expect(result2.isValid).toBe(false);
    });

    test('should handle non-object options', () => {
      const result = ErrorHandler.validateOptions('not an object');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle objects with problematic properties', () => {
      const obj = {};
      Object.defineProperty(obj, 'problematic', {
        get() { throw new Error('Cannot access'); },
        enumerable: true
      });
      
      expect(() => ErrorHandler.safeGetKeys(obj)).not.toThrow();
      expect(() => ErrorHandler.safeGetValues(obj)).not.toThrow();
    });

    test('should handle very deep objects', () => {
      let deep = {};
      let current = deep;
      
      for (let i = 0; i < 1000; i++) {
        current.nested = {};
        current = current.nested;
      }
      
      expect(ErrorHandler.hasCircularReference(deep)).toBe(false);
    });

    test('should handle objects with symbols', () => {
      const sym = Symbol('test');
      const obj = { [sym]: 'value', regular: 'property' };
      
      expect(ErrorHandler.safeGetKeys(obj)).toContain('regular');
      expect(ErrorHandler.safeHasProperty(obj, 'regular')).toBe(true);
    });
  });
});
