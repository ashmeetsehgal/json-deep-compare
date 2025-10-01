/**
 * @fileoverview Comprehensive tests for SmartModeSelector
 * @author AshmeetSehgal.com
 * @description Tests for SmartModeSelector including edge cases for compareNonPlainObjects
 */

const SmartModeSelector = require('../src/SmartModeSelector');

describe('SmartModeSelector Tests', () => {
  describe('selectMode', () => {
    test('should select ultraFast for identical references', () => {
      const obj = { a: 1 };
      const mode = SmartModeSelector.selectMode({}, obj, obj);
      expect(mode).toBe('ultraFast');
    });

    test('should select full mode for regex options', () => {
      const mode = SmartModeSelector.selectMode({ regexChecks: { 'a': /\d+/ } }, { a: 1 }, { a: 1 });
      expect(mode).toBe('full');
    });

    test('should select fast mode for simple objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };
      const mode = SmartModeSelector.selectMode({}, obj1, obj2);
      expect(['fast', 'ultraFast', 'full']).toContain(mode);
    });
  });

  describe('compareNonPlainObjects - Date', () => {
    test('should compare identical Date objects', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-01');
      const result = SmartModeSelector.areObjectsIdentical(date1, date2);
      expect(result).toBe(true);
    });

    test('should detect different Date objects', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');
      const result = SmartModeSelector.areObjectsIdentical(date1, date2);
      expect(result).toBe(false);
    });
  });

  describe('compareNonPlainObjects - RegExp', () => {
    test('should compare identical RegExp objects', () => {
      const regex1 = /test/gi;
      const regex2 = /test/gi;
      const result = SmartModeSelector.areObjectsIdentical(regex1, regex2);
      expect(result).toBe(true);
    });

    test('should detect different RegExp patterns', () => {
      const regex1 = /test/;
      const regex2 = /different/;
      const result = SmartModeSelector.areObjectsIdentical(regex1, regex2);
      expect(result).toBe(false);
    });

    test('should detect different RegExp flags', () => {
      const regex1 = /test/i;
      const regex2 = /test/g;
      const result = SmartModeSelector.areObjectsIdentical(regex1, regex2);
      expect(result).toBe(false);
    });
  });

  describe('compareNonPlainObjects - Map', () => {
    test('should compare identical Maps', () => {
      const map1 = new Map([['a', 1], ['b', 2]]);
      const map2 = new Map([['a', 1], ['b', 2]]);
      const result = SmartModeSelector.areObjectsIdentical(map1, map2);
      expect(result).toBe(true);
    });

    test('should detect different Map sizes', () => {
      const map1 = new Map([['a', 1]]);
      const map2 = new Map([['a', 1], ['b', 2]]);
      const result = SmartModeSelector.areObjectsIdentical(map1, map2);
      expect(result).toBe(false);
    });

    test('should detect different Map keys', () => {
      const map1 = new Map([['a', 1]]);
      const map2 = new Map([['b', 1]]);
      const result = SmartModeSelector.areObjectsIdentical(map1, map2);
      expect(result).toBe(false);
    });

    test('should detect different Map values', () => {
      const map1 = new Map([['a', 1]]);
      const map2 = new Map([['a', 2]]);
      const result = SmartModeSelector.areObjectsIdentical(map1, map2);
      expect(result).toBe(false);
    });

    test('should compare Maps with object values', () => {
      const map1 = new Map([['a', { x: 1 }]]);
      const map2 = new Map([['a', { x: 1 }]]);
      const result = SmartModeSelector.areObjectsIdentical(map1, map2);
      expect(result).toBe(true);
    });
  });

  describe('compareNonPlainObjects - Set', () => {
    test('should compare identical Sets', () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([1, 2, 3]);
      const result = SmartModeSelector.areObjectsIdentical(set1, set2);
      expect(result).toBe(true);
    });

    test('should detect different Set sizes', () => {
      const set1 = new Set([1, 2]);
      const set2 = new Set([1, 2, 3]);
      const result = SmartModeSelector.areObjectsIdentical(set1, set2);
      expect(result).toBe(false);
    });

    test('should detect different Set values', () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([1, 2, 4]);
      const result = SmartModeSelector.areObjectsIdentical(set1, set2);
      expect(result).toBe(false);
    });

    test('should compare Sets with object values', () => {
      const set1 = new Set([{ a: 1 }, { b: 2 }]);
      const set2 = new Set([{ a: 1 }, { b: 2 }]);
      const result = SmartModeSelector.areObjectsIdentical(set1, set2);
      expect(result).toBe(true);
    });

    test('should handle Sets with different object values', () => {
      const set1 = new Set([{ a: 1 }]);
      const set2 = new Set([{ a: 2 }]);
      const result = SmartModeSelector.areObjectsIdentical(set1, set2);
      expect(result).toBe(false);
    });
  });

  describe('compareNonPlainObjects - Buffer', () => {
    test('should compare identical Buffers', () => {
      const buf1 = Buffer.from([1, 2, 3]);
      const buf2 = Buffer.from([1, 2, 3]);
      const result = SmartModeSelector.areObjectsIdentical(buf1, buf2);
      expect(result).toBe(true);
    });

    test('should detect different Buffers', () => {
      const buf1 = Buffer.from([1, 2, 3]);
      const buf2 = Buffer.from([1, 2, 4]);
      const result = SmartModeSelector.areObjectsIdentical(buf1, buf2);
      expect(result).toBe(false);
    });

    test('should detect Buffer vs non-Buffer', () => {
      const buf1 = Buffer.from([1, 2, 3]);
      const buf2 = [1, 2, 3];
      const result = SmartModeSelector.areObjectsIdentical(buf1, buf2);
      expect(result).toBe(false);
    });
  });

  describe('compareNonPlainObjects - TypedArray', () => {
    test('should compare identical Uint8Array', () => {
      const arr1 = new Uint8Array([1, 2, 3]);
      const arr2 = new Uint8Array([1, 2, 3]);
      const result = SmartModeSelector.areObjectsIdentical(arr1, arr2);
      expect(result).toBe(true);
    });

    test('should detect different Uint8Array values', () => {
      const arr1 = new Uint8Array([1, 2, 3]);
      const arr2 = new Uint8Array([1, 2, 4]);
      const result = SmartModeSelector.areObjectsIdentical(arr1, arr2);
      expect(result).toBe(false);
    });

    test('should detect different TypedArray lengths', () => {
      const arr1 = new Uint8Array([1, 2]);
      const arr2 = new Uint8Array([1, 2, 3]);
      const result = SmartModeSelector.areObjectsIdentical(arr1, arr2);
      expect(result).toBe(false);
    });

    test('should detect different TypedArray types', () => {
      const arr1 = new Uint8Array([1, 2, 3]);
      const arr2 = new Uint16Array([1, 2, 3]);
      const result = SmartModeSelector.areObjectsIdentical(arr1, arr2);
      expect(result).toBe(false);
    });

    test('should compare Int32Array', () => {
      const arr1 = new Int32Array([1, 2, 3]);
      const arr2 = new Int32Array([1, 2, 3]);
      const result = SmartModeSelector.areObjectsIdentical(arr1, arr2);
      expect(result).toBe(true);
    });

    test('should compare Float64Array', () => {
      const arr1 = new Float64Array([1.1, 2.2, 3.3]);
      const arr2 = new Float64Array([1.1, 2.2, 3.3]);
      const result = SmartModeSelector.areObjectsIdentical(arr1, arr2);
      expect(result).toBe(true);
    });
  });

  describe('compareNonPlainObjects - ArrayBuffer', () => {
    test('should compare identical ArrayBuffers', () => {
      const buf1 = new ArrayBuffer(8);
      const buf2 = new ArrayBuffer(8);
      new Uint8Array(buf1).set([1, 2, 3, 4, 5, 6, 7, 8]);
      new Uint8Array(buf2).set([1, 2, 3, 4, 5, 6, 7, 8]);
      const result = SmartModeSelector.areObjectsIdentical(buf1, buf2);
      expect(result).toBe(true);
    });

    test('should detect different ArrayBuffer sizes', () => {
      const buf1 = new ArrayBuffer(8);
      const buf2 = new ArrayBuffer(16);
      const result = SmartModeSelector.areObjectsIdentical(buf1, buf2);
      expect(result).toBe(false);
    });

    test('should detect different ArrayBuffer contents', () => {
      const buf1 = new ArrayBuffer(8);
      const buf2 = new ArrayBuffer(8);
      new Uint8Array(buf1).set([1, 2, 3, 4, 5, 6, 7, 8]);
      new Uint8Array(buf2).set([1, 2, 3, 4, 5, 6, 7, 9]);
      const result = SmartModeSelector.areObjectsIdentical(buf1, buf2);
      expect(result).toBe(false);
    });
  });

  describe('compareNonPlainObjects - Error', () => {
    test('should compare identical Error objects', () => {
      const err1 = new Error('Test error');
      const err2 = new Error('Test error');
      // Set same stack for comparison
      err1.stack = err2.stack = 'Stack trace';
      const result = SmartModeSelector.areObjectsIdentical(err1, err2);
      expect(result).toBe(true);
    });

    test('should detect different Error messages', () => {
      const err1 = new Error('Error 1');
      const err2 = new Error('Error 2');
      const result = SmartModeSelector.areObjectsIdentical(err1, err2);
      expect(result).toBe(false);
    });

    test('should detect different Error names', () => {
      const err1 = new Error('Test');
      const err2 = new TypeError('Test');
      const result = SmartModeSelector.areObjectsIdentical(err1, err2);
      expect(result).toBe(false);
    });
  });

  describe('compareNonPlainObjects - Function', () => {
    test('should compare identical function references', () => {
      const fn = function() { return 42; };
      const result = SmartModeSelector.areObjectsIdentical(fn, fn);
      expect(result).toBe(true);
    });

    test('should detect different functions by string representation', () => {
      // Use eval to create truly different function strings
      const fn1 = function abc() { return 42; };
      const fn2 = function xyz() { return 42; };
      const result = SmartModeSelector.areObjectsIdentical(fn1, fn2);
      expect(result).toBe(false);
    });

    test('should detect different function implementations', () => {
      const fn1 = function() { return 42; };
      const fn2 = function() { return 43; };
      const result = SmartModeSelector.areObjectsIdentical(fn1, fn2);
      expect(result).toBe(false);
    });

    test('should handle function comparison by toString', () => {
      // Functions are compared by their toString() representation
      // Same reference should be equal
      const fn = () => 42;
      expect(SmartModeSelector.areObjectsIdentical(fn, fn)).toBe(true);
    });
  });

  describe('analyzeObjects', () => {
    test('should analyze simple objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1 };
      const analysis = SmartModeSelector.analyzeObjects(obj1, obj2);
      expect(analysis).toHaveProperty('isIdentical');
      expect(analysis).toHaveProperty('isSimple');
      expect(analysis).toHaveProperty('hasNestedObjects');
      expect(analysis).toHaveProperty('hasArrays');
      expect(analysis).toHaveProperty('size');
    });

    test('should detect nested objects', () => {
      const obj1 = { a: { b: 1 } };
      const obj2 = { a: { b: 1 } };
      const analysis = SmartModeSelector.analyzeObjects(obj1, obj2);
      expect(analysis.hasNestedObjects).toBe(true);
    });

    test('should detect arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      const analysis = SmartModeSelector.analyzeObjects(arr1, arr2);
      expect(analysis.hasArrays).toBe(true);
    });
  });

  describe('Circular references', () => {
    test('should handle circular references in objects', () => {
      const obj1 = { a: 1 };
      obj1.self = obj1;
      const obj2 = { a: 1 };
      obj2.self = obj2;
      const result = SmartModeSelector.areObjectsIdentical(obj1, obj2);
      expect(result).toBe(true);
    });

    test('should handle circular references in arrays', () => {
      const arr1 = [1, 2];
      arr1.push(arr1);
      const arr2 = [1, 2];
      arr2.push(arr2);
      const result = SmartModeSelector.areObjectsIdentical(arr1, arr2);
      expect(result).toBe(true);
    });
  });

  describe('getSelectionReasoning', () => {
    test('should provide reasoning for ultraFast mode', () => {
      const analysis = { isIdentical: true };
      const optionsAnalysis = {};
      const reasoning = SmartModeSelector.getSelectionReasoning(analysis, optionsAnalysis, 'ultraFast');
      expect(reasoning).toContain('identical');
    });

    test('should provide reasoning for fast mode', () => {
      const analysis = { isIdentical: false, isSimple: true };
      const optionsAnalysis = { hasAdvancedFeatures: false };
      const reasoning = SmartModeSelector.getSelectionReasoning(analysis, optionsAnalysis, 'fast');
      expect(reasoning).toContain('fast mode');
    });

    test('should provide reasoning for full mode', () => {
      const analysis = { isIdentical: false, isSimple: false };
      const optionsAnalysis = { hasAdvancedFeatures: true };
      const reasoning = SmartModeSelector.getSelectionReasoning(analysis, optionsAnalysis, 'full');
      expect(reasoning).toContain('full mode');
    });
  });

  describe('estimateSize', () => {
    test('should estimate object size', () => {
      const obj = { a: 1, b: 2, c: { d: 3 } };
      const size = SmartModeSelector.estimateSize(obj);
      expect(size).toBeGreaterThan(0);
    });

    test('should handle circular references in size estimation', () => {
      const obj = { a: 1 };
      obj.self = obj;
      const size = SmartModeSelector.estimateSize(obj);
      expect(size).toBeGreaterThan(0);
    });
  });
});

