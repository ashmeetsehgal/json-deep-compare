/**
 * @fileoverview Comprehensive tests for Result
 * @author AshmeetSehgal.com
 * @description Tests for Result to achieve high coverage
 */

const Result = require('../src/Result');

describe('Result Tests', () => {
  let result;

  beforeEach(() => {
    result = new Result();
  });

  describe('ResultPool', () => {
    test('should acquire new result when pool is empty', () => {
      const newResult = Result.create();
      expect(newResult).toBeInstanceOf(Result);
    });

    test('should reuse result from pool when available', () => {
      const result1 = Result.create();
      result1.release();
      
      const result2 = Result.create();
      expect(result2).toBeInstanceOf(Result);
    });

    test('should release result to pool', () => {
      const testResult = Result.create();
      testResult.release();
      // Result should be returned to pool
      expect(testResult).toBeDefined();
    });

    test('should clear pool', () => {
      const testResult = Result.create();
      testResult.release();
      
      // Clear pool
      Result.ResultPool.clear();
      expect(Result.ResultPool.pool.length).toBe(0);
    });

    test('should get pool statistics', () => {
      const stats = Result.ResultPool.getStats();
      expect(stats).toHaveProperty('poolSize');
      expect(stats).toHaveProperty('totalCreated');
      expect(stats).toHaveProperty('totalReused');
      expect(stats).toHaveProperty('maxPoolSize');
    });
  });

  describe('Constructor', () => {
    test('should initialize with default options', () => {
      expect(result.options).toEqual({});
      expect(result.data).toBeDefined();
      expect(result.data.matched.keys).toEqual([]);
      expect(result.data.matched.values).toEqual([]);
      expect(result.data.unmatched.keys).toEqual([]);
      expect(result.data.unmatched.values).toEqual([]);
      expect(result.data.unmatched.types).toEqual([]);
      expect(result.data.regexChecks).toEqual({ passed: [], failed: [] });
    });

    test('should initialize with custom options', () => {
      const options = { custom: 'value' };
      const customResult = new Result(options);
      expect(customResult.options).toBe(options);
    });
  });

  describe('create', () => {
    test('should create new result instance', () => {
      const newResult = Result.create();
      expect(newResult).toBeInstanceOf(Result);
    });

    test('should create result with options', () => {
      const options = { test: 'value' };
      const newResult = Result.create(options);
      expect(newResult.options).toBe(options);
    });
  });

  describe('release', () => {
    test('should release result to pool', () => {
      const testResult = new Result();
      testResult.release();
      // Result should be returned to pool
      expect(Result.ResultPool.pool.length).toBeGreaterThan(0);
    });
  });

  describe('reset', () => {
    test('should reset all data arrays', () => {
      result.addMatchedKey('test');
      result.addMatchedValue({ path: 'test', value: 'value' });
      result.addUnmatchedKey({ path: 'test', value: 'value' });
      result.addUnmatchedValue({ path: 'test', expected: 'a', actual: 'b' });
      result.addUnmatchedType({ path: 'test', expected: 'string', actual: 'number' });
      result.addPassedRegexCheck({ path: 'test', value: 'value' });
      result.addFailedRegexCheck({ path: 'test', value: 'value' });
      
      result.reset();
      
      expect(result.data.matched.keys).toEqual([]);
      expect(result.data.matched.values).toEqual([]);
      expect(result.data.unmatched.keys).toEqual([]);
      expect(result.data.unmatched.values).toEqual([]);
      expect(result.data.unmatched.types).toEqual([]);
      expect(result.data.regexChecks.passed).toEqual([]);
      expect(result.data.regexChecks.failed).toEqual([]);
    });

    test('should reset summary', () => {
      result.addMatchedKey('test');
      result.reset();
      
      const summary = result.getResult().summary;
      expect(summary.totalKeysCompared).toBe(0);
      expect(summary.matchPercentage).toBe(0);
    });
  });

  describe('addMatchedKey', () => {
    test('should add matched key', () => {
      result.addMatchedKey('test');
      expect(result.data.matched.keys).toContain('test');
    });

    test('should update summary after adding matched key', () => {
      result.addMatchedKey('test');
      const summary = result.getResult().summary;
      expect(summary.totalKeysCompared).toBe(1);
      expect(summary.matchPercentage).toBe(100);
    });
  });

  describe('addMatchedValue', () => {
    test('should add matched value', () => {
      const match = { path: 'test', value: 'value' };
      result.addMatchedValue(match);
      expect(result.data.matched.values).toContain(match);
    });

    test('should update summary after adding matched value', () => {
      result.addMatchedValue({ path: 'test', value: 'value' });
      const summary = result.getResult().summary;
      expect(summary.totalKeysCompared).toBe(1);
      expect(summary.matchPercentage).toBe(100);
    });
  });

  describe('addUnmatchedKey', () => {
    test('should add unmatched key', () => {
      const unmatch = { path: 'test', value: 'value', message: 'test message' };
      result.addUnmatchedKey(unmatch);
      expect(result.data.unmatched.keys).toContain(unmatch);
    });

    test('should update summary after adding unmatched key', () => {
      result.addUnmatchedKey({ path: 'test', value: 'value' });
      const summary = result.getResult().summary;
      expect(summary.totalKeysCompared).toBe(1);
      expect(summary.matchPercentage).toBe(0);
    });
  });

  describe('addUnmatchedValue', () => {
    test('should add unmatched value', () => {
      const unmatch = { path: 'test', expected: 'a', actual: 'b', message: 'test message' };
      result.addUnmatchedValue(unmatch);
      expect(result.data.unmatched.values).toContain(unmatch);
    });

    test('should update summary after adding unmatched value', () => {
      result.addUnmatchedValue({ path: 'test', expected: 'a', actual: 'b' });
      const summary = result.getResult().summary;
      expect(summary.totalKeysCompared).toBe(1);
      expect(summary.matchPercentage).toBe(0);
    });
  });

  describe('addUnmatchedType', () => {
    test('should add unmatched type', () => {
      const unmatch = { path: 'test', expected: 'string', actual: 'number', message: 'test message' };
      result.addUnmatchedType(unmatch);
      expect(result.data.unmatched.types).toContain(unmatch);
    });

    test('should update summary after adding unmatched type', () => {
      result.addUnmatchedType({ path: 'test', expected: 'string', actual: 'number' });
      const summary = result.getResult().summary;
      expect(summary.totalKeysCompared).toBe(1);
      expect(summary.matchPercentage).toBe(0);
    });
  });

  describe('addPassedRegexCheck', () => {
    test('should add passed regex check', () => {
      const check = { path: 'test', value: 'value', pattern: '/test/' };
      result.addPassedRegexCheck(check);
      expect(result.data.regexChecks.passed).toContain(check);
    });
  });

  describe('addFailedRegexCheck', () => {
    test('should add failed regex check', () => {
      const check = { path: 'test', value: 'value', pattern: '/test/', message: 'test message' };
      result.addFailedRegexCheck(check);
      expect(result.data.regexChecks.failed).toContain(check);
    });
  });

  describe('updateSummary', () => {
    test('should calculate correct summary for all matches', () => {
      result.addMatchedKey('key1');
      result.addMatchedValue({ path: 'key2', value: 'value' });
      
      const summary = result.getResult().summary;
      expect(summary.totalKeysCompared).toBe(2);
      expect(summary.matchPercentage).toBe(100);
    });

    test('should calculate correct summary for mixed results', () => {
      result.addMatchedKey('key1');
      result.addUnmatchedKey({ path: 'key2', value: 'value' });
      result.addUnmatchedValue({ path: 'key3', expected: 'a', actual: 'b' });
      
      const summary = result.getResult().summary;
      expect(summary.totalKeysCompared).toBe(3);
      expect(summary.matchPercentage).toBe(33.33);
    });

    test('should calculate correct summary for all mismatches', () => {
      result.addUnmatchedKey({ path: 'key1', value: 'value' });
      result.addUnmatchedValue({ path: 'key2', expected: 'a', actual: 'b' });
      result.addUnmatchedType({ path: 'key3', expected: 'string', actual: 'number' });
      
      const summary = result.getResult().summary;
      expect(summary.totalKeysCompared).toBe(3);
      expect(summary.matchPercentage).toBe(0);
    });

    test('should handle empty results', () => {
      const summary = result.getResult().summary;
      expect(summary.totalKeysCompared).toBe(0);
      expect(summary.matchPercentage).toBe(0);
    });

    test('should handle large numbers correctly', () => {
      for (let i = 0; i < 1000; i++) {
        result.addMatchedKey(`key${i}`);
      }
      
      const summary = result.getResult().summary;
      expect(summary.totalKeysCompared).toBe(1000);
      expect(summary.matchPercentage).toBe(100);
    });
  });

  describe('getResult', () => {
    test('should return complete result data', () => {
      result.addMatchedKey('test');
      result.addMatchedValue({ path: 'test', value: 'value' });
      result.addUnmatchedKey({ path: 'test', value: 'value' });
      result.addUnmatchedValue({ path: 'test', expected: 'a', actual: 'b' });
      result.addUnmatchedType({ path: 'test', expected: 'string', actual: 'number' });
      result.addPassedRegexCheck({ path: 'test', value: 'value' });
      result.addFailedRegexCheck({ path: 'test', value: 'value' });
      
      const resultData = result.getResult();
      
      expect(resultData).toHaveProperty('matched');
      expect(resultData).toHaveProperty('unmatched');
      expect(resultData).toHaveProperty('regexChecks');
      expect(resultData).toHaveProperty('summary');
    });

    test('should return summary with correct structure', () => {
      const resultData = result.getResult();
      const summary = resultData.summary;
      
      expect(summary).toHaveProperty('totalKeysCompared');
      expect(summary).toHaveProperty('matchPercentage');
      expect(typeof summary.totalKeysCompared).toBe('number');
      expect(typeof summary.matchPercentage).toBe('number');
    });
  });

  describe('Edge Cases', () => {
    test('should handle null and undefined values', () => {
      result.addMatchedValue({ path: 'test', value: null });
      result.addUnmatchedValue({ path: 'test', expected: undefined, actual: null });
      
      const resultData = result.getResult();
      expect(resultData.matched.values.length).toBe(1);
      expect(resultData.unmatched.values.length).toBe(1);
    });

    test('should handle empty strings', () => {
      result.addMatchedValue({ path: 'test', value: '' });
      result.addUnmatchedValue({ path: 'test', expected: '', actual: 'value' });
      
      const resultData = result.getResult();
      expect(resultData.matched.values.length).toBe(1);
      expect(resultData.unmatched.values.length).toBe(1);
    });

    test('should handle special characters in paths', () => {
      result.addMatchedKey('test.key[0]');
      result.addMatchedValue({ path: 'test.key[0]', value: 'value' });
      
      const resultData = result.getResult();
      expect(resultData.matched.keys).toContain('test.key[0]');
      expect(resultData.matched.values.length).toBe(1);
    });

    test('should handle very long paths', () => {
      const longPath = 'a'.repeat(1000);
      result.addMatchedKey(longPath);
      
      const resultData = result.getResult();
      expect(resultData.matched.keys).toContain(longPath);
    });

    test('should handle circular references in values', () => {
      const circular = {};
      circular.self = circular;
      
      result.addMatchedValue({ path: 'test', value: circular });
      
      const resultData = result.getResult();
      expect(resultData.matched.values.length).toBe(1);
    });
  });

  describe('Performance', () => {
    test('should handle large number of operations efficiently', () => {
      const start = Date.now();
      
      for (let i = 0; i < 10000; i++) {
        result.addMatchedKey(`key${i}`);
        result.addMatchedValue({ path: `key${i}`, value: `value${i}` });
      }
      
      const end = Date.now();
      const duration = end - start;
      
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
      
      const resultData = result.getResult();
      expect(resultData.matched.keys.length).toBe(10000);
      expect(resultData.matched.values.length).toBe(10000);
    });

    test('should handle frequent summary updates efficiently', () => {
      const start = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        result.addMatchedKey(`key${i}`);
        result.getResult(); // This triggers summary update
      }
      
      const end = Date.now();
      const duration = end - start;
      
      expect(duration).toBeLessThan(500); // Should complete in less than 0.5 seconds
    });
  });
});
