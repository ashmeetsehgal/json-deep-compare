/**
 * @fileoverview Basic example demonstrating JSONCompare
 * @author AshmeetSehgal.com
 */

const JSONCompare = require('../index');

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

// Create a simple comparator
const comparator = new JSONCompare();

// Perform the comparison
const result = comparator.compare(obj1, obj2);

console.log("\n=== BASIC COMPARISON RESULT ===");
console.log(`Match percentage: ${result.summary.matchPercentage.toFixed(2)}%`);
console.log(`Total keys compared: ${result.summary.totalKeysCompared}`);
console.log(`Total matched: ${result.summary.totalMatched}`);
console.log(`Total unmatched: ${result.summary.totalUnmatched}`);

// Print unmatched values
console.log("\n=== UNMATCHED VALUES ===");
result.unmatched.values.forEach(unmatch => {
  console.log(`Path: ${unmatch.path}`);
  console.log(`Expected: ${unmatch.expected}`);
  console.log(`Actual: ${unmatch.actual}`);
  console.log('---');
});