/**
 * @fileoverview Example demonstrating customization options in JSONCompare
 * @author AshmeetSehgal.com
 */

const JSONCompare = require('../index');

// Create objects with values to compare
const obj1 = {
  product: {
    name: "Smart Watch",
    price: 199.99,
    createdAt: "2025-03-15T10:30:00Z",
    updatedAt: "2025-04-01T16:45:00Z",
    inStock: true,
    inventory: 42,
    tags: ["electronics", "wearable", "smartwatch"],
    description: "A high-end smart watch with health monitoring features"
  },
  metadata: {
    version: 2,
    status: "active",
    isDeleted: false
  }
};

const obj2 = {
  product: {
    name: "Smart Watch",
    price: "199.99",  // String vs number
    createdAt: "2025-03-15T10:30:01Z", // Slightly different timestamp
    updatedAt: "2025-04-02T09:15:00Z", // Different timestamp (will be ignored)
    inStock: "true",  // String vs boolean
    inventory: "42",  // String vs number
    tags: ["electronics", "wearable", "watch"], // Different array element
    description: "A high-end smart watch with health monitoring features"
  },
  metadata: {
    version: "2",  // String vs number
    status: "ACTIVE", // Capitalization difference
    isDeleted: 0,     // 0 vs false
    extraField: "This is an extra field that will be ignored"
  }
};

// Create a JSONCompare instance with custom options
const compare = new JSONCompare({
  // Keys to ignore during comparison
  ignoredKeys: ['updatedAt', 'createdAt'],
  
  // Values to treat as equivalent
  equivalentValues: {
    'booleanLike': [true, 'true', 1],
    'falseyValues': [false, 'false', 0],
    'statusValues': ['active', 'ACTIVE', 'Active']
  },
  
  // Whether to ignore type differences
  strictTypes: false,
  
  // Ignore extra keys in the second object
  ignoreExtraKeys: true
});

// Perform the comparison
const result = compare.compare(obj1, obj2);

// Print results
console.log("\n=== MATCHED VALUES ===");
console.log(`Total matched: ${result.matched.values.length}`);
result.matched.values.slice(0, 3).forEach(match => { // Show first few matches
  console.log(`Path: ${match.path}`);
  console.log(`Value: ${match.value}`);
  if (match.type1 && match.type2) {
    console.log(`Types: ${match.type1} ≈ ${match.type2}`);
  }
  console.log('---');
});

console.log("\n=== EQUIVALENT VALUES ===");
result.matched.values.filter(m => m.message && m.message.includes("equivalent")).forEach(match => {
  console.log(`Path: ${match.path}`);
  console.log(`Value: ${match.value}`);
  console.log(`Types: ${match.type1 || match.type} ≈ ${match.type2 || match.type}`);
  console.log(`Message: ${match.message}`);
  console.log('---');
});

console.log("\n=== UNMATCHED VALUES ===");
result.unmatched.values.forEach(unmatch => {
  console.log(`Path: ${unmatch.path}`);
  console.log(`Expected: ${unmatch.expected} (${unmatch.expectedType || 'unknown type'})`);
  console.log(`Actual: ${unmatch.actual} (${unmatch.actualType || 'unknown type'})`);
  console.log('---');
});

console.log("\n=== IGNORED KEYS ===");
console.log(compare.options.ignoredKeys);

console.log("\n=== EXTRA KEYS ===");
const extraKeys = Object.keys(obj2.metadata).filter(key => !Object.keys(obj1.metadata).includes(key));
console.log(`Extra keys that were ignored: ${extraKeys}`);

console.log("\n=== SUMMARY ===");
console.log(`Match percentage: ${result.summary.matchPercentage.toFixed(2)}%`);
console.log(`Total keys compared: ${result.summary.totalKeysCompared}`);
console.log(`Total matched: ${result.summary.totalMatched}`);
console.log(`Total unmatched: ${result.summary.totalUnmatched}`);