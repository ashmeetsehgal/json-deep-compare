/**
 * @fileoverview Example demonstrating JSONCompare with type checking
 * @author AshmeetSehgal.com
 * Try this example online in the interactive playground:
 * https://ashmeetsehgal.com/tools/json-compare
 */

const JSONCompare = require('../index');

// Create objects with different types for comparison
const obj1 = {
  id: 1,                            // Number
  name: "Product",                  // String
  price: 19.99,                     // Number
  inStock: true,                    // Boolean
  tags: ["electronics", "gadget"],  // Array
  metadata: {                       // Object
    created: "2025-04-02",
    lastModified: null              // Null
  },
  rating: "4.5"                     // String (will be compared with a number)
};

const obj2 = {
  id: "1",                          // String (type mismatch with obj1.id)
  name: "Product",                  // String (matching)
  price: 19.99,                     // Number (matching)
  inStock: true,                    // Boolean (matching)
  tags: ["electronics", "sale"],    // Array (partially matching)
  metadata: {                       // Object
    created: "2025-04-02",
    lastModified: undefined         // Undefined (type mismatch with obj1.metadata.lastModified)
  },
  rating: 4.5                       // Number (type mismatch with obj1.rating)
};

// Create a JSONCompare instance
const compare = new JSONCompare({
  // Enable strict type checking (false by default)
  strictTypes: false,
  
  // Define equivalent values (useful for null/undefined comparison)
  equivalentValues: {
    'nullish': [null, undefined]
  }
});

// Perform the comparison
const result = compare.compare(obj1, obj2);

// Print a focused report on type mismatches
console.log("\n=== TYPE MISMATCHES ===");
result.unmatched.types.forEach(mismatch => {
  console.log(`Path: ${mismatch.path}`);
  console.log(`Expected type: ${mismatch.expected}, Actual type: ${mismatch.actual}`);
  console.log(`Message: ${mismatch.message}`);
  console.log('---');
});

// Print summary statistics
console.log("\n=== SUMMARY ===");
console.log(`Match percentage: ${result.summary.matchPercentage.toFixed(2)}%`);
console.log(`Total keys compared: ${result.summary.totalKeysCompared}`);
console.log(`Total matched: ${result.summary.totalMatched}`);
console.log(`Total unmatched: ${result.summary.totalUnmatched}`);
console.log(`Type mismatches: ${result.unmatched.types.length}`);

// Example with strict type checking
console.log("\n=== STRICT TYPE CHECKING ===");
const strictCompare = new JSONCompare({ strictTypes: true });
const strictResult = strictCompare.compare(obj1, obj2);
console.log(`Match percentage with strict types: ${strictResult.summary.matchPercentage.toFixed(2)}%`);
console.log(`Unmatched with strict types: ${strictResult.summary.totalUnmatched}`);