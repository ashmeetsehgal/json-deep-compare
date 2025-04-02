/**
 * @fileoverview Example demonstrating ES Module import with JSONCompare
 * @author AshmeetSehgal.com
 */

// ESM import example
import JSONCompare from '../index.js';

// Create objects to compare
const obj1 = {
  user: {
    id: 1001,
    profile: {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      preferences: {
        theme: "dark",
        notifications: true
      }
    },
    permissions: ["read", "write", "admin"]
  },
  metadata: {
    lastUpdated: "2025-04-01T15:30:00Z",
    version: 2.1
  }
};

const obj2 = {
  user: {
    id: "1001", // String instead of number
    profile: {
      firstName: "Jane",
      lastName: "Smith",
      email: "smith.jane@example.com", // Different email
      preferences: {
        theme: "light", // Different preference
        notifications: true
      }
    },
    permissions: ["read", "write", "admin", "delete"] // Extra permission
  },
  metadata: {
    lastUpdated: "2025-04-01T15:30:00Z",
    version: 2.1
  }
};

// Create a comparator with options
const comparator = new JSONCompare({
  regexChecks: {
    'email': /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'lastUpdated': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
  },
  matchKeysByName: true,
  equivalentValues: {
    'ids': [1001, '1001']
  }
});

// Perform comparison with validation
const result = comparator.compareAndValidate(obj1, obj2);

// Display results
console.log('\n=== ES MODULE IMPORT EXAMPLE RESULTS ===');
console.log(`Overall match percentage: ${result.summary.matchPercentage.toFixed(2)}%`);

// Summary of matches and differences
console.log('\n--- MATCHED VALUES ---');
console.log(`Total matched: ${result.summary.totalMatched}`);

console.log('\n--- DIFFERENCES ---');
if (result.unmatched.values.length > 0) {
  result.unmatched.values.forEach(diff => {
    console.log(`Field: ${diff.path}`);
    console.log(`Expected: ${JSON.stringify(diff.expected)}`);
    console.log(`Actual: ${JSON.stringify(diff.actual)}`);
    console.log(`Message: ${diff.message}`);
    console.log('---');
  });
}

// Check for array differences
const permissionsDiff = result.unmatched.values.find(v => v.path === 'user.permissions');
if (permissionsDiff) {
  console.log('\n--- ARRAY DIFFERENCES ---');
  console.log('Extra permissions:', permissionsDiff.actual.filter(p => !permissionsDiff.expected.includes(p)));
  console.log('Missing permissions:', permissionsDiff.expected.filter(p => !permissionsDiff.actual.includes(p)));
}

// Format validation results
console.log('\n--- FORMAT VALIDATION ---');
if (result.regexChecks.passed.length > 0) {
  console.log('Passed format validations:');
  result.regexChecks.passed.forEach(check => {
    console.log(`- ${check.path}: "${check.value}"`);
  });
}

if (result.regexChecks.failed.length > 0) {
  console.log('\nFailed format validations:');
  result.regexChecks.failed.forEach(check => {
    console.log(`- ${check.path}: "${check.value}" (pattern: ${check.pattern})`);
    console.log(`  Error: ${check.message}`);
  });
}

// Overall result
console.log('\n--- CONCLUSION ---');
console.log(`The objects are ${result.summary.matchPercentage >= 90 ? 'sufficiently similar' : 'too different'}.`);
console.log(`Total compared: ${result.summary.totalKeysCompared}, Matched: ${result.summary.totalMatched}, Unmatched: ${result.summary.totalUnmatched}`);