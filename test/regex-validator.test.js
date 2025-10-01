/**
 * @fileoverview Comprehensive tests for RegexValidator
 * @author AshmeetSehgal.com
 * @description Tests for RegexValidator to achieve high coverage
 */

const RegexValidator = require('../src/RegexValidator');
const Result = require('../src/Result');

describe('RegexValidator Tests', () => {
  let result;
  let validator;

  beforeEach(() => {
    result = new Result();
  });

  describe('RegexCache', () => {
    test('should cache regex patterns', () => {
      const options = {
        regexChecks: {
          'test': 'test'
        }
      };
      validator = new RegexValidator(options, result);
      
      expect(validator.compiledRegexChecks.test).toBeInstanceOf(RegExp);
      expect(validator.compiledRegexChecks.test.toString()).toBe('/test/');
    });

    test('should handle RegExp patterns', () => {
      const options = {
        regexChecks: {
          'test': /test/
        }
      };
      validator = new RegexValidator(options, result);
      
      expect(validator.compiledRegexChecks.test).toBeInstanceOf(RegExp);
    });
  });

  describe('Constructor', () => {
    test('should initialize with default options', () => {
      validator = new RegexValidator({}, result);
      expect(validator.options).toEqual({});
      expect(validator.result).toBe(result);
      expect(validator.compiledRegexChecks).toEqual({});
    });

    test('should initialize with regex checks', () => {
      const options = {
        regexChecks: {
          'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          'phone': /^\d{10}$/
        }
      };
      
      validator = new RegexValidator(options, result);
      expect(validator.compiledRegexChecks).toHaveProperty('email');
      expect(validator.compiledRegexChecks).toHaveProperty('phone');
    });

    test('should handle string patterns', () => {
      const options = {
        regexChecks: {
          'email': '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
          'phone': '^\\d{10}$'
        }
      };
      
      validator = new RegexValidator(options, result);
      expect(validator.compiledRegexChecks.email).toBeInstanceOf(RegExp);
      expect(validator.compiledRegexChecks.phone).toBeInstanceOf(RegExp);
    });

    test('should handle mixed pattern types', () => {
      const options = {
        regexChecks: {
          'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          'phone': '^\\d{10}$'
        }
      };
      
      validator = new RegexValidator(options, result);
      expect(validator.compiledRegexChecks.email).toBeInstanceOf(RegExp);
      expect(validator.compiledRegexChecks.phone).toBeInstanceOf(RegExp);
    });
  });

  describe('validateValue', () => {
    beforeEach(() => {
      const options = {
        regexChecks: {
          'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          'phone': /^\d{10}$/
        }
      };
      validator = new RegexValidator(options, result);
    });

    test('should skip non-string values', () => {
      validator.validateValue(123, 'test');
      validator.validateValue(null, 'test');
      validator.validateValue(undefined, 'test');
      validator.validateValue({}, 'test');
      validator.validateValue([], 'test');
      
      const resultData = result.getResult();
      expect(resultData.regexChecks.passed.length).toBe(0);
      expect(resultData.regexChecks.failed.length).toBe(0);
    });

    test('should validate string values', () => {
      validator.validateValue('test@example.com', 'email');
      validator.validateValue('1234567890', 'phone');
      
      const resultData = result.getResult();
      expect(resultData.regexChecks.passed.length).toBe(2);
    });

    test('should fail invalid string values', () => {
      validator.validateValue('invalid-email', 'email');
      validator.validateValue('123', 'phone');
      
      const resultData = result.getResult();
      expect(resultData.regexChecks.failed.length).toBe(2);
    });

    test('should handle exact path matches', () => {
      validator.validateValue('test@example.com', 'email');
      const resultData = result.getResult();
      expect(resultData.regexChecks.passed.length).toBe(1);
    });

    test('should handle partial path matches', () => {
      validator.validateValue('test@example.com', 'user.email');
      const resultData = result.getResult();
      expect(resultData.regexChecks.passed.length).toBe(1);
    });

    test('should handle key name matches when enabled', () => {
      validator.options.matchKeysByName = true;
      validator.validateValue('test@example.com', 'email');
      const resultData = result.getResult();
      expect(resultData.regexChecks.passed.length).toBe(1);
    });

    test('should skip key name matches when disabled', () => {
      validator.options.matchKeysByName = false;
      validator.validateValue('test@example.com', 'email');
      const resultData = result.getResult();
      expect(resultData.regexChecks.passed.length).toBe(0);
    });
  });

  describe('_checkRegex', () => {
    beforeEach(() => {
      validator = new RegexValidator({}, result);
    });

    test('should add passed regex check', () => {
      const regex = /test/;
      validator._checkRegex('test', 'path', regex);
      
      const resultData = result.getResult();
      expect(resultData.regexChecks.passed.length).toBe(1);
      expect(resultData.regexChecks.passed[0].path).toBe('path');
      expect(resultData.regexChecks.passed[0].value).toBe('test');
    });

    test('should add failed regex check', () => {
      const regex = /test/;
      validator._checkRegex('fail', 'path', regex);
      
      const resultData = result.getResult();
      expect(resultData.regexChecks.failed.length).toBe(1);
      expect(resultData.regexChecks.failed[0].path).toBe('path');
      expect(resultData.regexChecks.failed[0].value).toBe('fail');
    });
  });

  describe('validateAllMatchingKeys', () => {
    test('should skip when matchKeysByName is disabled', () => {
      validator = new RegexValidator({}, result);
      validator.options.matchKeysByName = false;
      
      const obj = { email: 'test@example.com' };
      validator.validateAllMatchingKeys(obj);
      
      const resultData = result.getResult();
      expect(resultData.regexChecks.passed.length).toBe(0);
    });

    test('should validate matching keys when enabled', () => {
      const options = {
        regexChecks: {
          'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        matchKeysByName: true
      };
      validator = new RegexValidator(options, result);
      
      const obj = { email: 'test@example.com' };
      validator.validateAllMatchingKeys(obj);
      
      const resultData = result.getResult();
      expect(resultData.regexChecks.passed.length).toBe(1);
    });

    test('should handle nested objects', () => {
      const options = {
        regexChecks: {
          'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        matchKeysByName: true
      };
      validator = new RegexValidator(options, result);
      
      const obj = {
        user: {
          email: 'test@example.com',
          name: 'John Doe'
        }
      };
      validator.validateAllMatchingKeys(obj);
      
      const resultData = result.getResult();
      expect(resultData.regexChecks.passed.length).toBe(1);
    });

    test('should handle arrays', () => {
      const options = {
        regexChecks: {
          'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        matchKeysByName: true
      };
      validator = new RegexValidator(options, result);
      
      const obj = {
        users: [
          { email: 'test1@example.com' },
          { email: 'test2@example.com' }
        ]
      };
      validator.validateAllMatchingKeys(obj);
      
      const resultData = result.getResult();
      expect(resultData.regexChecks.passed.length).toBe(2);
    });

    test('should skip non-string values', () => {
      const options = {
        regexChecks: {
          'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        matchKeysByName: true
      };
      validator = new RegexValidator(options, result);
      
      const obj = {
        email: 123,
        name: 'John Doe'
      };
      validator.validateAllMatchingKeys(obj);
      
      const resultData = result.getResult();
      expect(resultData.regexChecks.passed.length).toBe(0);
    });

    test('should handle multiple regex patterns', () => {
      const options = {
        regexChecks: {
          'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          'phone': /^\d{10}$/
        },
        matchKeysByName: true
      };
      validator = new RegexValidator(options, result);
      
      const obj = {
        email: 'test@example.com',
        phone: '1234567890',
        name: 'John Doe'
      };
      validator.validateAllMatchingKeys(obj);
      
      const resultData = result.getResult();
      expect(resultData.regexChecks.passed.length).toBe(2);
    });
  });

  describe('_isPathChecked', () => {
    beforeEach(() => {
      validator = new RegexValidator({}, result);
    });

    test('should return false for unchecked path', () => {
      expect(validator._isPathChecked('test')).toBe(false);
    });

    test('should return true for checked path', () => {
      validator._checkRegex('test', 'path', /test/);
      expect(validator._isPathChecked('path')).toBe(true);
    });

    test('should return true for failed path', () => {
      validator._checkRegex('fail', 'path', /test/);
      expect(validator._isPathChecked('path')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty regex checks', () => {
      validator = new RegexValidator({}, result);
      validator.validateValue('test', 'path');
      
      const resultData = result.getResult();
      expect(resultData.regexChecks.passed.length).toBe(0);
    });

    test('should handle invalid regex patterns', () => {
      const options = {
        regexChecks: {
          'invalid': '[invalid'
        }
      };
      
      expect(() => {
        validator = new RegexValidator(options, result);
      }).toThrow();
    });

    test('should handle null and undefined values', () => {
      validator = new RegexValidator({}, result);
      validator.validateValue(null, 'path');
      validator.validateValue(undefined, 'path');
      
      const resultData = result.getResult();
      expect(resultData.regexChecks.passed.length).toBe(0);
    });

    test('should handle empty strings', () => {
      const options = {
        regexChecks: {
          'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        }
      };
      validator = new RegexValidator(options, result);
      
      validator.validateValue('', 'email');
      const resultData = result.getResult();
      expect(resultData.regexChecks.failed.length).toBe(1);
    });

    test('should handle complex regex patterns', () => {
      const options = {
        regexChecks: {
          'complex': /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        }
      };
      validator = new RegexValidator(options, result);
      
      validator.validateValue('Password123!', 'complex');
      validator.validateValue('weak', 'complex');
      
      const resultData = result.getResult();
      expect(resultData.regexChecks.passed.length).toBe(1);
      expect(resultData.regexChecks.failed.length).toBe(1);
    });
  });

  describe('Performance', () => {
    test('should handle large objects efficiently', () => {
      const options = {
        regexChecks: {
          'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        matchKeysByName: true
      };
      validator = new RegexValidator(options, result);
      
      const obj = {};
      for (let i = 0; i < 1000; i++) {
        obj[`user${i}`] = { email: `test${i}@example.com` };
      }
      
      validator.validateAllMatchingKeys(obj);
      const resultData = result.getResult();
      expect(resultData.regexChecks.passed.length).toBe(1000);
    });

    test('should cache regex patterns efficiently', () => {
      // Use a unique pattern to avoid interference from other tests
      const pattern = `test-unique-pattern-${Date.now()}`;
      const startSize = RegexValidator.RegexCache.size();
      
      // Get same pattern multiple times
      for (let i = 0; i < 100; i++) {
        RegexValidator.RegexCache.getRegex(pattern);
      }
      
      const endSize = RegexValidator.RegexCache.size();
      expect(endSize - startSize).toBe(1); // Only one new pattern cached
    });
  });
});
