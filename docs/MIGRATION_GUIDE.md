# Migration Guide to json-deep-compare

## Seamlessly Migrate from Other JSON Comparison Libraries

This guide helps you migrate from popular JSON comparison libraries to `json-deep-compare` with step-by-step examples and best practices.

## Table of Contents

- [Quick Migration Overview](#quick-migration-overview)
- [From lodash.isEqual](#from-lodashisequal)
- [From deep-equal](#from-deep-equal)
- [From Jest's toEqual](#from-jests-toequal)
- [From assert.deepEqual](#from-assertdeepequal)
- [From Chai's deep.equal](#from-chais-deepequal)
- [Common Migration Patterns](#common-migration-patterns)
- [Feature Upgrade Guide](#feature-upgrade-guide)
- [Performance Benefits](#performance-benefits)
- [Troubleshooting](#troubleshooting)

## Quick Migration Overview

| Source Library | Migration Complexity | Key Benefits | Estimated Time |
|----------------|---------------------|--------------|----------------|
| **lodash.isEqual** | 🟡 Medium | Better performance, detailed results | 2-4 hours |
| **deep-equal** | 🟢 Easy | Advanced features, regex validation | 1-2 hours |
| **jest.toEqual** | 🟡 Medium | Framework independence, better debugging | 2-3 hours |
| **assert.deepEqual** | 🟢 Easy | Enhanced error reporting, customization | 1-2 hours |
| **chai.deep.equal** | 🟢 Easy | More powerful assertions, type checking | 1-2 hours |

## From lodash.isEqual

### Basic Replacement

```javascript
// Before (lodash)
import { isEqual } from 'lodash';

function compareObjects(obj1, obj2) {
  return isEqual(obj1, obj2); // Returns only true/false
}

// After (json-deep-compare)
import JSONCompare from 'json-deep-compare';

function compareObjects(obj1, obj2) {
  const comparator = new JSONCompare();
  const result = comparator.compare(obj1, obj2);
  return result.summary.matchPercentage === 100;
}

// Or get detailed information
function compareObjectsDetailed(obj1, obj2) {
  const comparator = new JSONCompare();
  const result = comparator.compare(obj1, obj2);
  
  return {
    isEqual: result.summary.matchPercentage === 100,
    differences: result.unmatched.values,
    matchPercentage: result.summary.matchPercentage
  };
}
```

### Advanced Migration with Custom Options

```javascript
// Before (lodash with custom logic)
import { isEqual, isEqualWith } from 'lodash';

function customCompare(obj1, obj2) {
  return isEqualWith(obj1, obj2, (objValue, othValue, key) => {
    // Ignore timestamp fields
    if (key === 'timestamp' || key === 'updatedAt') {
      return true;
    }
    // Custom logic for numbers vs strings
    if (typeof objValue === 'number' && typeof othValue === 'string') {
      return objValue.toString() === othValue;
    }
  });
}

// After (json-deep-compare)
import JSONCompare from 'json-deep-compare';

function customCompare(obj1, obj2) {
  const comparator = new JSONCompare({
    ignoredKeys: ['timestamp', 'updatedAt'],
    equivalentValues: {
      'numberString': [1, '1', 2, '2'] // Define all number-string pairs
    },
    strictTypes: false // Allow type coercion
  });
  
  const result = comparator.compare(obj1, obj2);
  return result.summary.matchPercentage === 100;
}
```

### Bundle Size Optimization

```javascript
// Before (importing full lodash - 70KB+)
import _ from 'lodash';
const isEqual = _.isEqual;

// OR importing just isEqual (still brings dependencies)
import isEqual from 'lodash/isEqual';

// After (json-deep-compare - <10KB, zero dependencies)
import JSONCompare from 'json-deep-compare';
const comparator = new JSONCompare();

// Bundle size reduction: ~85% smaller
```

### API Testing Migration

```javascript
// Before (lodash in tests)
import { isEqual } from 'lodash';

describe('API Tests', () => {
  test('user response validation', async () => {
    const response = await api.getUser(123);
    const expected = { id: 123, name: 'John', email: 'john@test.com' };
    
    expect(isEqual(response, expected)).toBe(true); // Limited error info
  });
});

// After (json-deep-compare)
import JSONCompare from 'json-deep-compare';

describe('API Tests', () => {
  const apiValidator = new JSONCompare({
    regexChecks: {
      'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'id': /^\d+$/
    }
  });
  
  test('user response validation', async () => {
    const response = await api.getUser(123);
    const expected = { id: 123, name: 'John', email: 'john@test.com' };
    
    const result = apiValidator.compareAndValidate(expected, response);
    
    expect(result.summary.matchPercentage).toBe(100);
    expect(result.regexChecks.failed).toHaveLength(0);
    
    // Detailed debugging if needed
    if (result.summary.matchPercentage < 100) {
      console.log('Specific differences:', result.unmatched.values);
    }
  });
});
```

## From deep-equal

### Basic Migration

```javascript
// Before (deep-equal)
import deepEqual from 'deep-equal';

function validateData(expected, actual) {
  if (!deepEqual(expected, actual)) {
    throw new Error('Data validation failed');
  }
}

// After (json-deep-compare)
import JSONCompare from 'json-deep-compare';

function validateData(expected, actual) {
  const comparator = new JSONCompare();
  const result = comparator.compare(expected, actual);
  
  if (result.summary.matchPercentage < 100) {
    const differences = result.unmatched.values
      .map(v => `${v.path}: expected ${v.expected}, got ${v.actual}`)
      .join(', ');
    throw new Error(`Data validation failed: ${differences}`);
  }
}
```

### Adding Validation Features

```javascript
// Before (basic deep-equal)
import deepEqual from 'deep-equal';

const result = deepEqual(obj1, obj2);

// After (with additional validation)
import JSONCompare from 'json-deep-compare';

const comparator = new JSONCompare({
  regexChecks: {
    'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    'timestamp': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
    'id': /^\d+$/
  },
  equivalentValues: {
    'booleans': [true, 'true', 1],
    'nullish': [null, undefined, '']
  }
});

const result = comparator.compareAndValidate(obj1, obj2);
const isEqual = result.summary.matchPercentage === 100 && 
                result.regexChecks.failed.length === 0;
```

### Type Checking Enhancement

```javascript
// Before (deep-equal - basic type handling)
import deepEqual from 'deep-equal';

// Limited type information on mismatch
const isEqual = deepEqual({ id: 1 }, { id: '1' }); // false

// After (detailed type information)
import JSONCompare from 'json-deep-compare';

const comparator = new JSONCompare({ strictTypes: true });
const result = comparator.compare({ id: 1 }, { id: '1' });

if (result.unmatched.types.length > 0) {
  result.unmatched.types.forEach(mismatch => {
    console.log(`Type mismatch at ${mismatch.path}:`);
    console.log(`Expected: ${mismatch.expected}, Got: ${mismatch.actual}`);
  });
}
```

## From Jest's toEqual

### Basic Test Migration

```javascript
// Before (Jest only)
describe('Data Tests', () => {
  test('object comparison', () => {
    const expected = { name: 'John', age: 30 };
    const actual = getUserData();
    
    expect(actual).toEqual(expected); // Throws on mismatch
  });
});

// After (framework agnostic)
import JSONCompare from 'json-deep-compare';

describe('Data Tests', () => {
  const comparator = new JSONCompare();
  
  test('object comparison', () => {
    const expected = { name: 'John', age: 30 };
    const actual = getUserData();
    
    const result = comparator.compare(expected, actual);
    
    expect(result.summary.matchPercentage).toBe(100);
    
    // Better debugging information
    if (result.summary.matchPercentage < 100) {
      console.log('Differences found:', result.unmatched.values);
    }
  });
});
```

### Custom Jest Matcher

```javascript
// Create a custom matcher that wraps json-deep-compare
import JSONCompare from 'json-deep-compare';

expect.extend({
  toDeepCompare(received, expected, options = {}) {
    const comparator = new JSONCompare(options);
    const result = comparator.compare(expected, received);
    
    if (result.summary.matchPercentage === 100) {
      return {
        pass: true,
        message: () => 'Objects match completely'
      };
    }
    
    const differences = result.unmatched.values
      .map(v => `  ${v.path}: expected ${v.expected}, received ${v.actual}`)
      .join('\n');
      
    return {
      pass: false,
      message: () => `Objects don't match:\n${differences}`
    };
  }
});

// Usage
test('enhanced comparison', () => {
  expect(actualData).toDeepCompare(expectedData, {
    regexChecks: {
      'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    ignoredKeys: ['timestamp']
  });
});
```

### API Response Testing Migration

```javascript
// Before (Jest API testing)
describe('API Tests', () => {
  test('user endpoint', async () => {
    const response = await api.getUser(123);
    
    expect(response).toEqual({
      id: 123,
      name: expect.any(String),
      email: expect.any(String),
      createdAt: expect.any(String)
    });
  });
});

// After (enhanced API testing)
import JSONCompare from 'json-deep-compare';

describe('API Tests', () => {
  const apiComparator = new JSONCompare({
    regexChecks: {
      'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'createdAt': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    }
  });
  
  test('user endpoint', async () => {
    const response = await api.getUser(123);
    
    const result = apiComparator.compareAndValidate({
      id: 123,
      name: expect.any(String),
      email: expect.any(String),
      createdAt: expect.any(String)
    }, response);
    
    expect(result.summary.matchPercentage).toBe(100);
    expect(result.regexChecks.failed).toHaveLength(0);
  });
});
```

## From assert.deepEqual

### Node.js Testing Migration

```javascript
// Before (Node.js assert)
import assert from 'assert';

function testDataIntegrity(expected, actual) {
  try {
    assert.deepEqual(actual, expected);
    console.log('✅ Test passed');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// After (enhanced error reporting)
import JSONCompare from 'json-deep-compare';

function testDataIntegrity(expected, actual) {
  const comparator = new JSONCompare();
  const result = comparator.compare(expected, actual);
  
  if (result.summary.matchPercentage === 100) {
    console.log('✅ Test passed');
  } else {
    console.error('❌ Test failed:');
    result.unmatched.values.forEach(v => {
      console.error(`  ${v.path}: expected ${v.expected}, got ${v.actual}`);
    });
  }
}
```

### Adding Validation Rules

```javascript
// Before (basic assert)
import assert from 'assert';

function validateConfig(config) {
  const expected = {
    host: 'localhost',
    port: 3000,
    ssl: false
  };
  
  assert.deepEqual(config, expected);
}

// After (with validation)
import JSONCompare from 'json-deep-compare';

function validateConfig(config) {
  const comparator = new JSONCompare({
    regexChecks: {
      'host': /^[a-zA-Z0-9.-]+$/,
      'port': /^\d{1,5}$/
    },
    equivalentValues: {
      'booleans': [false, 'false', 0]
    }
  });
  
  const expected = {
    host: 'localhost',
    port: 3000,
    ssl: false
  };
  
  const result = comparator.compareAndValidate(expected, config);
  
  if (result.summary.matchPercentage < 100 || result.regexChecks.failed.length > 0) {
    throw new Error('Configuration validation failed');
  }
}
```

## From Chai's deep.equal

### Mocha/Chai Migration

```javascript
// Before (Chai)
import { expect } from 'chai';

describe('Data Validation', () => {
  it('should match expected structure', () => {
    const actual = getData();
    const expected = { id: 1, name: 'test' };
    
    expect(actual).to.deep.equal(expected);
  });
});

// After (json-deep-compare with Chai)
import { expect } from 'chai';
import JSONCompare from 'json-deep-compare';

describe('Data Validation', () => {
  const comparator = new JSONCompare();
  
  it('should match expected structure', () => {
    const actual = getData();
    const expected = { id: 1, name: 'test' };
    
    const result = comparator.compare(expected, actual);
    
    expect(result.summary.matchPercentage).to.equal(100);
  });
});
```

### Custom Chai Assertion

```javascript
// Create custom Chai assertion
import JSONCompare from 'json-deep-compare';

chai.use(function(chai, utils) {
  chai.Assertion.addMethod('deepCompare', function(expected, options = {}) {
    const actual = this._obj;
    const comparator = new JSONCompare(options);
    const result = comparator.compare(expected, actual);
    
    this.assert(
      result.summary.matchPercentage === 100,
      'expected #{actual} to deep compare with #{expected}',
      'expected #{actual} not to deep compare with #{expected}',
      expected,
      actual
    );
  });
});

// Usage
expect(actualData).to.deepCompare(expectedData, {
  regexChecks: {
    'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
});
```

## Common Migration Patterns

### 1. Error Handling Migration

```javascript
// Before (try-catch with basic libraries)
function safeCompare(obj1, obj2) {
  try {
    return deepEqual(obj1, obj2);
  } catch (error) {
    console.error('Comparison failed:', error.message);
    return false;
  }
}

// After (structured error handling)
function safeCompare(obj1, obj2) {
  try {
    const comparator = new JSONCompare();
    const result = comparator.compare(obj1, obj2);
    
    if (result.summary.matchPercentage < 100) {
      console.warn('Comparison differences found:');
      result.unmatched.values.forEach(v => {
        console.warn(`  ${v.path}: ${v.message}`);
      });
    }
    
    return result.summary.matchPercentage === 100;
  } catch (error) {
    console.error('Comparison error:', error.message);
    return false;
  }
}
```

### 2. Configuration Object Migration

```javascript
// Before (multiple libraries)
const comparisonConfig = {
  // Different config for each library
  lodashCustomizer: (objValue, othValue, key) => { /* logic */ },
  deepEqualOptions: { strict: true },
  jestMatcherOptions: { /* options */ }
};

// After (unified configuration)
const comparisonConfig = {
  regexChecks: {
    'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    'id': /^\d+$/,
    'timestamp': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
  },
  ignoredKeys: ['requestId', 'serverTime'],
  equivalentValues: {
    'booleans': [true, 'true', 1],
    'nullish': [null, undefined, '']
  },
  strictTypes: false,
  matchKeysByName: true
};

const comparator = new JSONCompare(comparisonConfig);
```

### 3. Async Testing Migration

```javascript
// Before (various approaches)
async function testAsyncData() {
  const data = await fetchData();
  
  // Different assertion styles
  assert.deepEqual(data, expected);        // Node.js
  expect(data).toEqual(expected);          // Jest
  expect(data).to.deep.equal(expected);   // Chai
}

// After (consistent approach)
async function testAsyncData() {
  const data = await fetchData();
  const comparator = new JSONCompare({
    regexChecks: {
      'timestamp': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    },
    ignoredKeys: ['fetchTime']
  });
  
  const result = comparator.compareAndValidate(expected, data);
  
  if (result.summary.matchPercentage < 100) {
    throw new Error(`Validation failed: ${result.unmatched.values.length} differences`);
  }
}
```

## Feature Upgrade Guide

### 1. Add Regex Validation

```javascript
// Before (no validation)
const isEqual = compareLibrary(obj1, obj2);

// After (with validation)
const comparator = new JSONCompare({
  regexChecks: {
    'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    'phone': /^\+?[1-9]\d{1,14}$/,
    'url': /^https?:\/\/.+/,
    'uuid': /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
  }
});

const result = comparator.compareAndValidate(obj1, obj2);
```

### 2. Add Detailed Reporting

```javascript
// Before (boolean result)
const isEqual = compareLibrary(obj1, obj2);
if (!isEqual) {
  console.log('Objects are different'); // No details
}

// After (detailed reporting)
const result = comparator.compare(obj1, obj2);
if (result.summary.matchPercentage < 100) {
  console.log(`Match: ${result.summary.matchPercentage}%`);
  console.log('Differences:');
  result.unmatched.values.forEach(v => {
    console.log(`  ${v.path}: expected ${v.expected}, got ${v.actual}`);
  });
}
```

### 3. Add Performance Monitoring

```javascript
// Before (no performance tracking)
const isEqual = compareLibrary(obj1, obj2);

// After (with performance tracking)
console.time('comparison');
const result = comparator.compare(obj1, obj2);
console.timeEnd('comparison');

console.log(`Compared ${result.summary.totalKeysCompared} keys in ${performance.now()} ms`);
```

## Performance Benefits

### Bundle Size Comparison

```javascript
// Before
import _ from 'lodash';           // ~70KB + dependencies
import deepEqual from 'deep-equal'; // ~5KB
import { expect } from '@jest/globals'; // Large bundle

// After
import JSONCompare from 'json-deep-compare'; // <10KB, zero dependencies
```

### Runtime Performance

```javascript
// Performance test example
const largeObject1 = generateLargeObject(10000); // 10K properties
const largeObject2 = generateLargeObject(10000);

// Benchmark different libraries
console.time('lodash.isEqual');
const lodashResult = isEqual(largeObject1, largeObject2);
console.timeEnd('lodash.isEqual'); // ~28ms

console.time('json-deep-compare');
const result = comparator.compare(largeObject1, largeObject2);
console.timeEnd('json-deep-compare'); // ~18ms (37% faster)
```

## Troubleshooting

### Common Migration Issues

#### 1. Type Coercion Differences

```javascript
// Problem: Different type handling
// Old library: true == 'true' (might be true)
// json-deep-compare: strict by default

// Solution: Configure equivalent values
const comparator = new JSONCompare({
  equivalentValues: {
    'booleans': [true, 'true', 1],
    'numbers': [0, '0', false]
  }
});
```

#### 2. Nested Path Differences

```javascript
// Problem: Different path notation
// Old: 'users[0].profile.name'
// New: 'users[0].profile.name' (same, but more detailed reporting)

// Solution: Use detailed path information
result.unmatched.values.forEach(v => {
  console.log(`Mismatch at: ${v.path}`);
  console.log(`Expected: ${v.expected} (${v.expectedType})`);
  console.log(`Actual: ${v.actual} (${v.actualType})`);
});
```

#### 3. Async Testing Patterns

```javascript
// Problem: Different async handling patterns

// Solution: Consistent async pattern
async function migratedTest() {
  const data = await fetchData();
  const result = comparator.compareAndValidate(expected, data);
  
  // Works with any testing framework
  if (result.summary.matchPercentage < 100) {
    throw new Error('Validation failed');
  }
}
```

### Migration Checklist

- [ ] **Bundle Analysis**: Check bundle size reduction
- [ ] **Test Coverage**: Ensure all comparisons are migrated
- [ ] **Performance**: Benchmark comparison performance
- [ ] **Error Handling**: Update error handling for detailed results
- [ ] **Configuration**: Consolidate comparison options
- [ ] **Validation**: Add regex validation where appropriate
- [ ] **Documentation**: Update team documentation
- [ ] **Training**: Train team on new features

### Step-by-Step Migration Process

1. **Identify Usage**: Find all instances of old comparison library
2. **Create Configuration**: Define unified JSONCompare configuration
3. **Replace Gradually**: Migrate one module at a time
4. **Add Features**: Enhance with regex validation and detailed reporting
5. **Test Thoroughly**: Ensure all tests pass with new implementation
6. **Monitor Performance**: Verify performance improvements
7. **Remove Dependencies**: Clean up old library dependencies

---

**Related Resources:**
- [API Testing Guide](./API_TESTING_GUIDE.md) - Learn advanced testing patterns
- [Performance Benchmarks](./PERFORMANCE_BENCHMARKS.md) - See detailed performance comparisons
- [Comparison Guide](./COMPARISON_GUIDE.md) - Feature-by-feature comparison

**Community Support:**
- [GitHub Discussions](https://github.com/ashmeetsehgal/json-deep-compare/discussions) - Get migration help
- [Issue Tracker](https://github.com/ashmeetsehgal/json-deep-compare/issues) - Report migration issues
- [Interactive Playground](https://ashmeetsehgal.com/tools/json-compare) - Test migration scenarios