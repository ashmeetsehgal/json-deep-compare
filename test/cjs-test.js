// Test for CommonJS module format
const JSONCompare = require('../dist/cjs/index');

// Simple test objects
const obj1 = { name: 'John', age: 30 };
const obj2 = { name: 'John', age: 30 };
const obj3 = { name: 'John', age: '30' }; // age is string, not number

// Create comparator instance
const comparator = new JSONCompare();

// Test 1: Should match exactly
const result1 = comparator.compare(obj1, obj2);
console.log('CJS - Test 1 (Should match):', result1.summary.matchPercentage === 100 ? 'PASS' : 'FAIL');

// Test 2: Should detect type mismatch with strict types
const result2 = comparator.compare(obj1, obj3);
console.log('CJS - Test 2 (Should detect type mismatch):', result2.unmatched.types.length > 0 ? 'PASS' : 'FAIL');

// Test 3: Should match with non-strict types
const nonStrictComparator = new JSONCompare({ strictTypes: false });
const result3 = nonStrictComparator.compare(obj1, obj3);
console.log('CJS - Test 3 (Should match with non-strict types):', result3.summary.matchPercentage === 100 ? 'PASS' : 'FAIL');