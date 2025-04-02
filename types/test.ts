/**
 * This is a test file to verify TypeScript type definitions
 * It's not meant to be executed, just to check that types are working correctly
 */

// This is a mock import that will satisfy Jest but still let us test the types
import JSONCompare, { JSONCompareOptions, JSONCompareResult } from 'json-deep-compare';

// Mock implementation just to avoid runtime errors
jest.mock('json-deep-compare', () => {
  return {
    __esModule: true,
    default: class MockJSONCompare {
      constructor(options?: any) {}
      compare(obj1: any, obj2: any) { 
        return { 
          matched: { keys: [], values: [] },
          unmatched: { keys: [], values: [], types: [] },
          regexChecks: { passed: [], failed: [] },
          summary: { matchPercentage: 100, totalKeysCompared: 0, totalMatched: 0, totalUnmatched: 0, totalRegexChecks: 0 }
        };
      }
      compareAndValidate(obj1: any, obj2: any) { return this.compare(obj1, obj2); }
      validate(obj: any) { return this.compare(obj, {}); }
      getOptions() { return {}; }
    }
  };
});

// Test constructor with options
const options: JSONCompareOptions = {
  ignoredKeys: ['createdAt', 'updatedAt'],
  equivalentValues: {
    'booleanTypes': [true, 'true', 1],
    'emptyValues': [null, undefined, '']
  },
  regexChecks: {
    'email': /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'phone': '\\+\\d{1,3}-\\d{3,14}',
  },
  strictTypes: true,
  ignoreExtraKeys: false,
  matchKeysByName: true
};

// Create instance with and without options
const compareWithOptions = new JSONCompare(options);
const compareWithoutOptions = new JSONCompare();

// Test objects
const obj1 = {
  id: 1,
  name: "Product",
  price: 19.99
};

const obj2 = {
  id: "1",
  name: "Product",
  price: "19.99"
};

describe('TypeScript Type Tests', () => {
  test('Type definitions should be valid', () => {
    // Test compare method
    const result: JSONCompareResult = compareWithOptions.compare(obj1, obj2);
    
    // Access result properties
    const matchPercentage: number = result.summary.matchPercentage;
    const totalMatched: number = result.summary.totalMatched;
    
    // This test doesn't actually check anything at runtime,
    // it's just to verify the TypeScript types compile correctly
    expect(true).toBe(true);
  });
});