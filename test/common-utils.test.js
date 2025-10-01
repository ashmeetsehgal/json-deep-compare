/**
 * @fileoverview Comprehensive tests for CommonUtils
 * @author AshmeetSehgal.com
 * @description Tests for CommonUtils to achieve high coverage and reduce duplication
 */

const CommonUtils = require('../src/CommonUtils');

describe('CommonUtils Tests', () => {
  describe('safeWarn', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test('should log warning with context and message', () => {
      CommonUtils.safeWarn('test', 'test message');
      expect(consoleSpy).toHaveBeenCalledWith('Error in test: test message');
    });

    test('should log warning with error object', () => {
      const error = new Error('test error');
      CommonUtils.safeWarn('test', 'test message', error);
      expect(consoleSpy).toHaveBeenCalledWith('Error in test: test message', 'test error');
    });
  });

  describe('isArray', () => {
    test('should return true for arrays', () => {
      expect(CommonUtils.isArray([])).toBe(true);
      expect(CommonUtils.isArray([1, 2, 3])).toBe(true);
      expect(CommonUtils.isArray(new Array())).toBe(true);
    });

    test('should return false for non-arrays', () => {
      expect(CommonUtils.isArray({})).toBe(false);
      expect(CommonUtils.isArray('string')).toBe(false);
      expect(CommonUtils.isArray(123)).toBe(false);
      expect(CommonUtils.isArray(null)).toBe(false);
      expect(CommonUtils.isArray(undefined)).toBe(false);
    });
  });

  describe('isObject', () => {
    test('should return true for objects', () => {
      expect(CommonUtils.isObject({})).toBe(true);
      expect(CommonUtils.isObject([])).toBe(true);
      expect(CommonUtils.isObject(new Date())).toBe(true);
    });

    test('should return false for null and primitives', () => {
      expect(CommonUtils.isObject(null)).toBe(false);
      expect(CommonUtils.isObject(undefined)).toBe(false);
      expect(CommonUtils.isObject('string')).toBe(false);
      expect(CommonUtils.isObject(123)).toBe(false);
      expect(CommonUtils.isObject(true)).toBe(false);
    });
  });

  describe('isNullOrUndefined', () => {
    test('should return true for null and undefined', () => {
      expect(CommonUtils.isNullOrUndefined(null)).toBe(true);
      expect(CommonUtils.isNullOrUndefined(undefined)).toBe(true);
    });

    test('should return false for other values', () => {
      expect(CommonUtils.isNullOrUndefined(0)).toBe(false);
      expect(CommonUtils.isNullOrUndefined('')).toBe(false);
      expect(CommonUtils.isNullOrUndefined(false)).toBe(false);
      expect(CommonUtils.isNullOrUndefined({})).toBe(false);
      expect(CommonUtils.isNullOrUndefined([])).toBe(false);
    });
  });

  describe('isPrimitive', () => {
    test('should return true for primitives', () => {
      expect(CommonUtils.isPrimitive(null)).toBe(true);
      expect(CommonUtils.isPrimitive(undefined)).toBe(true);
      expect(CommonUtils.isPrimitive('string')).toBe(true);
      expect(CommonUtils.isPrimitive(123)).toBe(true);
      expect(CommonUtils.isPrimitive(true)).toBe(true);
    });

    test('should return false for objects', () => {
      expect(CommonUtils.isPrimitive({})).toBe(false);
      expect(CommonUtils.isPrimitive([])).toBe(false);
      expect(CommonUtils.isPrimitive(new Date())).toBe(false);
    });
  });

  describe('isString', () => {
    test('should return true for strings', () => {
      expect(CommonUtils.isString('hello')).toBe(true);
      expect(CommonUtils.isString('')).toBe(true);
      expect(CommonUtils.isString('123')).toBe(true);
    });

    test('should return false for non-strings', () => {
      expect(CommonUtils.isString(123)).toBe(false);
      expect(CommonUtils.isString({})).toBe(false);
      expect(CommonUtils.isString(null)).toBe(false);
    });
  });

  describe('isNumber', () => {
    test('should return true for numbers', () => {
      expect(CommonUtils.isNumber(123)).toBe(true);
      expect(CommonUtils.isNumber(0)).toBe(true);
      expect(CommonUtils.isNumber(-123)).toBe(true);
      expect(CommonUtils.isNumber(123.45)).toBe(true);
    });

    test('should return false for non-numbers', () => {
      expect(CommonUtils.isNumber('123')).toBe(false);
      expect(CommonUtils.isNumber({})).toBe(false);
      expect(CommonUtils.isNumber(null)).toBe(false);
    });

    test('should return true for NaN as it is a number type', () => {
      expect(CommonUtils.isNumber(NaN)).toBe(true);
    });
  });

  describe('isBoolean', () => {
    test('should return true for booleans', () => {
      expect(CommonUtils.isBoolean(true)).toBe(true);
      expect(CommonUtils.isBoolean(false)).toBe(true);
    });

    test('should return false for non-booleans', () => {
      expect(CommonUtils.isBoolean(0)).toBe(false);
      expect(CommonUtils.isBoolean('true')).toBe(false);
      expect(CommonUtils.isBoolean({})).toBe(false);
    });
  });

  describe('isFunction', () => {
    test('should return true for functions', () => {
      expect(CommonUtils.isFunction(() => {})).toBe(true);
      expect(CommonUtils.isFunction(function() {})).toBe(true);
      expect(CommonUtils.isFunction(Array.isArray)).toBe(true);
    });

    test('should return false for non-functions', () => {
      expect(CommonUtils.isFunction({})).toBe(false);
      expect(CommonUtils.isFunction('function')).toBe(false);
      expect(CommonUtils.isFunction(null)).toBe(false);
    });
  });

  describe('safeExecute', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test('should execute function successfully', () => {
      const result = CommonUtils.safeExecute(() => 'success', 'test');
      expect(result).toBe('success');
    });

    test('should return fallback on error', () => {
      const result = CommonUtils.safeExecute(() => {
        throw new Error('test error');
      }, 'test', 'fallback');
      expect(result).toBe('fallback');
      expect(consoleSpy).toHaveBeenCalled();
    });

    test('should use default fallback', () => {
      const result = CommonUtils.safeExecute(() => {
        throw new Error('test error');
      }, 'test');
      expect(result).toBe(null);
    });
  });

  describe('safeGet', () => {
    test('should get property from object', () => {
      const obj = { a: 1, b: 2 };
      expect(CommonUtils.safeGet(obj, 'a')).toBe(1);
      expect(CommonUtils.safeGet(obj, 'b')).toBe(2);
    });

    test('should return default for missing property', () => {
      const obj = { a: 1 };
      expect(CommonUtils.safeGet(obj, 'c')).toBe(undefined);
      expect(CommonUtils.safeGet(obj, 'c', 'default')).toBe('default');
    });

    test('should return default for non-object', () => {
      expect(CommonUtils.safeGet(null, 'a')).toBe(undefined);
      expect(CommonUtils.safeGet('string', 'a', 'default')).toBe('default');
    });
  });

  describe('safeLength', () => {
    test('should return length for arrays', () => {
      expect(CommonUtils.safeLength([1, 2, 3])).toBe(3);
      expect(CommonUtils.safeLength([])).toBe(0);
    });

    test('should return 0 for non-arrays', () => {
      expect(CommonUtils.safeLength({})).toBe(0);
      expect(CommonUtils.safeLength('string')).toBe(0);
      expect(CommonUtils.safeLength(null)).toBe(0);
    });
  });

  describe('safeKeys', () => {
    test('should return keys for objects', () => {
      const obj = { a: 1, b: 2 };
      const keys = CommonUtils.safeKeys(obj);
      expect(keys).toEqual(['a', 'b']);
    });

    test('should return empty array for non-objects', () => {
      expect(CommonUtils.safeKeys(null)).toEqual([]);
      expect(CommonUtils.safeKeys('string')).toEqual([]);
    });
  });

  describe('safeValues', () => {
    test('should return values for objects', () => {
      const obj = { a: 1, b: 2 };
      const values = CommonUtils.safeValues(obj);
      expect(values).toEqual([1, 2]);
    });

    test('should return empty array for non-objects', () => {
      expect(CommonUtils.safeValues(null)).toEqual([]);
      expect(CommonUtils.safeValues('string')).toEqual([]);
    });
  });

  describe('safeHasProperty', () => {
    test('should check property existence', () => {
      const obj = { a: 1 };
      expect(CommonUtils.safeHasProperty(obj, 'a')).toBe(true);
      expect(CommonUtils.safeHasProperty(obj, 'b')).toBe(false);
    });

    test('should return false for non-objects', () => {
      expect(CommonUtils.safeHasProperty(null, 'a')).toBe(false);
      expect(CommonUtils.safeHasProperty('string', 'a')).toBe(false);
    });
  });

  describe('safeEqual', () => {
    test('should compare equal values', () => {
      expect(CommonUtils.safeEqual(1, 1)).toBe(true);
      expect(CommonUtils.safeEqual('hello', 'hello')).toBe(true);
      expect(CommonUtils.safeEqual(null, null)).toBe(true);
      expect(CommonUtils.safeEqual(undefined, undefined)).toBe(true);
    });

    test('should handle NaN comparison', () => {
      expect(CommonUtils.safeEqual(NaN, NaN)).toBe(true);
      expect(CommonUtils.safeEqual(NaN, 1)).toBe(false);
    });

    test('should compare different values', () => {
      expect(CommonUtils.safeEqual(1, 2)).toBe(false);
      expect(CommonUtils.safeEqual('hello', 'world')).toBe(false);
    });
  });

  describe('safeTypeEqual', () => {
    test('should compare equal types', () => {
      expect(CommonUtils.safeTypeEqual(1, 2)).toBe(true);
      expect(CommonUtils.safeTypeEqual('a', 'b')).toBe(true);
      expect(CommonUtils.safeTypeEqual({}, [])).toBe(true);
    });

    test('should handle null/undefined', () => {
      expect(CommonUtils.safeTypeEqual(null, null)).toBe(true);
      expect(CommonUtils.safeTypeEqual(undefined, undefined)).toBe(true);
      expect(CommonUtils.safeTypeEqual(null, undefined)).toBe(false);
    });

    test('should compare different types', () => {
      expect(CommonUtils.safeTypeEqual(1, '1')).toBe(false);
      expect(CommonUtils.safeTypeEqual(true, 'true')).toBe(false);
    });
  });

  describe('safeArrayEqual', () => {
    test('should compare equal arrays', () => {
      expect(CommonUtils.safeArrayEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(CommonUtils.safeArrayEqual([], [])).toBe(true);
    });

    test('should compare different arrays', () => {
      expect(CommonUtils.safeArrayEqual([1, 2], [1, 2, 3])).toBe(false);
      expect(CommonUtils.safeArrayEqual([1, 2], [2, 1])).toBe(false);
    });

    test('should return false for non-arrays', () => {
      expect(CommonUtils.safeArrayEqual([1, 2], {})).toBe(false);
      expect(CommonUtils.safeArrayEqual(null, [])).toBe(false);
    });
  });

  describe('safeObjectEqual', () => {
    test('should compare equal objects', () => {
      expect(CommonUtils.safeObjectEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(CommonUtils.safeObjectEqual({}, {})).toBe(true);
    });

    test('should compare different objects', () => {
      expect(CommonUtils.safeObjectEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(CommonUtils.safeObjectEqual({ a: 1 }, { b: 1 })).toBe(false);
    });

    test('should return false for non-objects', () => {
      expect(CommonUtils.safeObjectEqual({}, [])).toBe(false);
      expect(CommonUtils.safeObjectEqual(null, {})).toBe(false);
    });
  });

  describe('safeHasCircularReference', () => {
    test('should detect circular references', () => {
      const obj = { a: 1 };
      obj.self = obj;
      expect(CommonUtils.safeHasCircularReference(obj)).toBe(true);
    });

    test('should not detect circular references in normal objects', () => {
      const obj = { a: 1, b: { c: 2 } };
      expect(CommonUtils.safeHasCircularReference(obj)).toBe(false);
    });

    test('should return false for non-objects', () => {
      expect(CommonUtils.safeHasCircularReference(null)).toBe(false);
      expect(CommonUtils.safeHasCircularReference('string')).toBe(false);
    });
  });

  describe('safeValidateOptions', () => {
    test('should validate correct options', () => {
      const options = { a: 1, b: 'string' };
      const schema = {
        a: { type: 'number', required: true },
        b: { type: 'string', required: true }
      };
      expect(CommonUtils.safeValidateOptions(options, schema)).toBe(true);
    });

    test('should reject invalid options', () => {
      const options = { a: 'string' };
      const schema = {
        a: { type: 'number', required: true }
      };
      expect(CommonUtils.safeValidateOptions(options, schema)).toBe(false);
    });

    test('should reject missing required options', () => {
      const options = { a: 1 };
      const schema = {
        a: { type: 'number', required: true },
        b: { type: 'string', required: true }
      };
      expect(CommonUtils.safeValidateOptions(options, schema)).toBe(false);
    });

    test('should return false for non-objects', () => {
      const schema = { a: { type: 'number', required: true } };
      expect(CommonUtils.safeValidateOptions(null, schema)).toBe(false);
    });
  });

  describe('safeMeasurePerformance', () => {
    test('should measure function performance', () => {
      const result = CommonUtils.safeMeasurePerformance(() => 'test', 'test');
      expect(result.result).toBe('test');
      expect(result.context).toBe('test');
      expect(typeof result.duration).toBe('number');
    });

    test('should handle function errors', () => {
      const result = CommonUtils.safeMeasurePerformance(() => {
        throw new Error('test error');
      }, 'test');
      expect(result.result).toBe(null);
      expect(result.context).toBe('test');
    });
  });

  describe('safeGetMemoryUsage', () => {
    test('should return memory usage information', () => {
      const usage = CommonUtils.safeGetMemoryUsage();
      expect(usage).toHaveProperty('heapUsed');
      expect(usage).toHaveProperty('heapTotal');
      expect(usage).toHaveProperty('external');
      expect(usage).toHaveProperty('rss');
    });
  });
});
