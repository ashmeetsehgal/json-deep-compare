# JSON Deep Compare with Field Validator

[![Test](https://github.com/ashmeetsehgal/json-deep-compare/actions/workflows/test.yml/badge.svg)](https://github.com/ashmeetsehgal/json-deep-compare/actions/workflows/test.yml)
[![Code Coverage](https://github.com/ashmeetsehgal/json-deep-compare/actions/workflows/coverage.yml/badge.svg)](https://github.com/ashmeetsehgal/json-deep-compare/actions/workflows/coverage.yml)
[![Pull Request Validation](https://github.com/ashmeetsehgal/json-deep-compare/actions/workflows/pr-validation.yml/badge.svg)](https://github.com/ashmeetsehgal/json-deep-compare/actions/workflows/pr-validation.yml)
[![Publish to npm on merge](https://github.com/ashmeetsehgal/json-deep-compare/actions/workflows/npm-publish-on-merge.yml/badge.svg)](https://github.com/ashmeetsehgal/json-deep-compare/actions/workflows/npm-publish-on-merge.yml)
[![NPM Version](https://img.shields.io/npm/v/json-deep-compare.svg)](https://www.npmjs.com/package/json-deep-compare)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/ashmeetsehgal/json-deep-compare/blob/main/LICENSE)
[![Website](https://img.shields.io/badge/Website-ashmeetsehgal.com-blue)](https://ashmeetsehgal.com)

A powerful and flexible library for comparing JSON objects with support for deep comparison, regex validation, and customizable options.

## Playground

Try before you implement! Test the library's capabilities and experiment with different comparison options using our interactive playground:

**[JSON Deep Compare Playground](https://ashmeetsehgal.com/tools/json-compare)**

The playground allows you to:
- Compare JSON objects in real-time
- Customize comparison options
- Visualize match results and differences
- Test regex validations

## Features

- **Deep Comparison**: Perform a deep comparison of JSON objects, including nested objects and arrays.
- **Advanced Type Checking**: Compare values with precise type detection, identifying specific data types (string, number, array, object, null, etc.) and providing detailed type mismatch information.
- **Key and Value Type Comparison**: Compare both keys and value types, ensuring that mismatches in types are reported.
- **Regex Checks**: Validate string values against regex patterns, with support for both exact path matching and key name matching.
- **Result Structure**: Get results in a structured format that clearly indicates matched keys and values, unmatched keys, unmatched values, and regex check results.
- **Customizable Options**: Customize the comparison behavior with options for ignoring specific keys, treating certain values as equivalent, and handling different data types.
- **TypeScript Support**: Full TypeScript type definitions included for better development experience.
- **Performance Optimized**: Designed to efficiently handle large JSON objects.

## Installation

```bash
npm install json-deep-compare
```

## Basic Usage

```javascript
const JSONCompare = require('json-deep-compare');

// Create objects to compare
const obj1 = {
  user: {
    name: "Ashmeet Sehgal",
    email: "ashmeet@ashmeetsehgal.com",
    details: {
      phone: "+91-9876543210"
    }
  },
  products: [
    { id: "PROD-123", name: "Product 1" }
  ]
};

const obj2 = {
  user: {
    name: "Ashmeet Sehgal",
    email: "contact@ashmeetsehgal.com", // Different email
    details: {
      phone: "+91-9876543210"
    }
  },
  products: [
    { id: "PROD-123", name: "Product 1" }
  ]
};

// Create a comparator with regex checks
const comparator = new JSONCompare({
  regexChecks: {
    'email': /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'phone': /\+\d{1,3}-\d{3,14}/,  // Will match any key named 'phone'
    'products[0].id': /^PROD-\d+$/
  },
  matchKeysByName: true // Enable matching by key name for regex checks
});

// Perform the comparison
const result = comparator.compareAndValidate(obj1, obj2);

console.log(result);
```

## Options

You can customize the comparison behavior with the following options:

```javascript
const options = {
  // Keys to ignore during comparison
  ignoredKeys: ['createdAt', 'updatedAt'],
  
  // Values to treat as equivalent
  equivalentValues: {
    'booleanTypes': [true, 'true', 1],
    'emptyValues': [null, undefined, '']
  },
  
  // Regex patterns for value validation
  regexChecks: {
    'email': /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'user.details.phone': '\\+\\d{1,3}-\\d{3,14}',  // String pattern
    'products[0].id': /^PROD-\d+$/
  },
  
  // Whether to strictly compare types
  strictTypes: true,
  
  // Whether to ignore keys in obj2 that aren't in obj1
  ignoreExtraKeys: false,
  
  // Whether to match regex by key name instead of only by path
  matchKeysByName: true
};

const comparator = new JSONCompare(options);
```

## Result Structure

The comparison result has the following structure:

```javascript
{
  matched: {
    keys: [],    // Matched keys
    values: []   // Matched values
  },
  unmatched: {
    keys: [],    // Keys found in one object but not the other
    values: [],  // Values that don't match
    types: []    // Values with mismatched types
  },
  regexChecks: {
    passed: [],  // Values that passed regex validation
    failed: []   // Values that failed regex validation
  },
  summary: {
    matchPercentage: 0,     // Percentage of matched elements
    totalKeysCompared: 0,   // Total number of keys compared
    totalMatched: 0,        // Total number of matched elements
    totalUnmatched: 0,      // Total number of unmatched elements
    totalRegexChecks: 0     // Total number of regex checks performed
  }
}
```

## Advanced Usage

### Matching by Key Name

With the `matchKeysByName` option set to `true`, the library will apply regex checks to all keys with matching names, not just exact paths. This is useful for validating all fields of a specific type regardless of their location in the object.

```javascript
const comparator = new JSONCompare({
  regexChecks: {
    'email': /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  },
  matchKeysByName: true
});

// This will validate both user.email and customer.email fields
```

### Treating Values as Equivalent

You can define sets of values that should be treated as equivalent:

```javascript
const comparator = new JSONCompare({
  equivalentValues: {
    'booleanTypes': [true, 'true', 1],
    'emptyValues': [null, undefined, '']
  }
});

// true, 'true', and 1 will be considered equivalent
// null, undefined, and '' will be considered equivalent
```

### Ignoring Extra Keys

If you only care about whether obj2 contains all the keys from obj1, you can ignore extra keys:

```javascript
const comparator = new JSONCompare({
  ignoreExtraKeys: true
});

// Keys in obj2 that aren't in obj1 will be ignored
```

## Type Checking

The library includes advanced type checking capabilities to identify and report the specific types of values being compared.

### Supported Types

The following types are precisely detected:
- Primitive types: `string`, `number`, `boolean`, `undefined`
- Complex types: `array`, `object`, `null`
- Special objects: `date`, `regex`
- Custom object types based on constructor name

### Type Checking Example

```javascript
const JSONCompare = require('json-deep-compare');

const obj1 = {
  id: 1,                     // Number
  name: "Product",           // String
  price: "19.99"             // String (will be compared with a number)
};

const obj2 = {
  id: "1",                   // String (type mismatch with obj1.id)
  name: "Product",           // String (matching)
  price: 19.99               // Number (type mismatch with obj1.price)
};

// Create a JSONCompare instance
const compare = new JSONCompare({
  strictTypes: false  // Set to true to fail comparison on type mismatches
});

// Perform the comparison
const result = compare.compare(obj1, obj2);

// Check for type mismatches
if (result.unmatched.types.length > 0) {
  console.log("Type mismatches found:");
  result.unmatched.types.forEach(mismatch => {
    console.log(`Path: ${mismatch.path}`);
    console.log(`Expected type: ${mismatch.expected}, Actual type: ${mismatch.actual}`);
  });
}
```

### Strict Type Checking

When `strictTypes` is set to `true`, the comparison will stop at the first type mismatch for each path:

```javascript
const strictCompare = new JSONCompare({ strictTypes: true });
const strictResult = strictCompare.compare(obj1, obj2);
```

### Type Information in Results

Type information is included in both matched and unmatched values:

```javascript
// For matched values
{
  path: "name",
  value: "Product",
  type: "string"
}

// For unmatched values
{
  path: "id",
  expected: 1,
  actual: "1",
  expectedType: "number",
  actualType: "string",
  message: "Values do not match"
}

// For type mismatches
{
  path: "id",
  expected: "number",
  actual: "string",
  message: "Types do not match: expected 'number', got 'string'"
}
```

### Type-Safe Equivalence

When using equivalence rules with different types, the types are still reported correctly:

```javascript
const compare = new JSONCompare({
  equivalentValues: {
    'nullish': [null, undefined]
  }
});

// Result will show:
// "Values considered equivalent by rule 'nullish'"
// but will still report type1: "null", type2: "undefined"
```

## License

MIT

## Support This Project

If you find this library useful for your projects, please consider supporting its development and maintenance:

- ⭐ Star the project on GitHub - It helps increase visibility

Your support helps keep this project maintained and improved with new features!
