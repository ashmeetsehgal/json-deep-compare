/**
 * @fileoverview Main example showing key functionality of JSONCompare
 * @author AshmeetSehgal.com
 * 
 * Try this example online in the interactive playground:
 * https://ashmeetsehgal.com/tools/json-compare
 */

const JSONCompare = require("../index");

// Example objects
const obj1 = {
  user: {
    name: "Ashmeet Sehgal",
    email: "ashmeet@ashmeetsehgal.com",
    details: {
      phone: "+91-9876543210",
      age: 30,
    },
  },
  customer: {
    email: "contact@ashmeetsehgal.com",
  },
  products: [
    { id: "PROD-123", name: "Product 1" },
    { id: "PROD-456", name: "Product 2" },
  ],
  metadata: {
    createdAt: "2023-01-01",
    tags: ["example", "demo"],
  },
};

const obj2 = {
  user: {
    name: "Ashmeet Sehgal",
    email: "ashmeet@ashmeet", // Invalid email format
    details: {
      phone: "9876543210", // Missing country code
      age: "30", // String instead of number
    },
  },
  customer: {
    email: "contact@ashmeetsehgal.com",
  },
  products: [
    { id: "PROD-123", name: "Product 1" },
    { id: "ABC-456", name: "Product 2" }, // Invalid ID format
  ],
  metadata: {
    createdAt: "2023-01-01",
    updatedAt: "2023-01-02", // Extra field
  },
};

// Create comparator with options
const comparator = new JSONCompare({
  ignoredKeys: ["updatedAt"],
  equivalentValues: {
    numberTypes: [30, "30"],
  },
  regexChecks: {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^\+\d{1,3}-\d{3,14}$/,
    "products[0].id": /^PROD-\d+$/,
    "products[1].id": /^PROD-\d+$/,
  },
  strictTypes: false, // Don't enforce strict type checking
  ignoreExtraKeys: false,
  matchKeysByName: true, // Enable matching by key name for regex checks
});

// Perform comparison
const result = comparator.compareAndValidate(obj1, obj2);

// Log the results
console.log(JSON.stringify(result, null, 2));

// Log summary
console.log("\n--- SUMMARY ---");
console.log(`Match percentage: ${result.summary.matchPercentage.toFixed(2)}%`);
console.log(`Total keys compared: ${result.summary.totalKeysCompared}`);
console.log(`Total matched: ${result.summary.totalMatched}`);
console.log(`Total unmatched: ${result.summary.totalUnmatched}`);
console.log(`Total regex checks: ${result.summary.totalRegexChecks}`);

// Log regex check failures specifically
console.log("\n--- REGEX CHECK FAILURES ---");
result.regexChecks.failed.forEach((failure) => {
  console.log(`Path: ${failure.path}`);
  console.log(`Value: ${failure.value}`);
  console.log(`Pattern: ${failure.pattern}`);
  console.log(`Message: ${failure.message}`);
  console.log("---");
});
