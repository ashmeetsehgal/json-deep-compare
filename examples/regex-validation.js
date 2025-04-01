/**
 * @fileoverview Example demonstrating regex validation in JSONCompare
 * @author AshmeetSehgal.com
 */

const JSONCompare = require('../index');

// Create objects with values to validate against regex patterns
const obj = {
  user: {
    email: "user@example.com",
    phone: "+1-555-123-4567",
    website: "https://example.com",
    id: "USER-12345",
    zipCode: "10001"
  },
  addresses: [
    {
      street: "123 Main St",
      city: "New York",
      state: "NY", 
      zipCode: "10001",
      country: "USA",
      phone: "+1-555-987-6543"
    },
    {
      street: "456 Park Ave",
      city: "Boston",
      state: "MA",
      zipCode: "02108",
      country: "USA", 
      phone: "Invalid Phone"  // This will fail validation
    }
  ],
  productId: "PROD-98765"
};

// Create a JSONCompare instance with regex validation patterns
const compare = new JSONCompare({
  regexChecks: {
    // Validate by exact path
    'user.email': /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'user.website': /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    'user.id': /^USER-\d+$/,
    
    // Validate by key name (will match any key with this name)
    'phone': /^\+\d{1,3}-\d{3}-\d{3}-\d{4}$/,
    'zipCode': /^\d{5}$/,
    'productId': /^PROD-\d+$/
  },
  // Enable matching by key name
  matchKeysByName: true
});

// Validate the object against regex patterns
const result = compare.validate(obj);

// Print regex check results
console.log("\n=== REGEX VALIDATION PASSED ===");
result.regexChecks.passed.forEach(check => {
  console.log(`Path: ${check.path}`);
  console.log(`Value: ${check.value}`);
  console.log(`Pattern: ${check.pattern}`);
  console.log(`Matched by name: ${check.matchedByName ? 'Yes' : 'No'}`);
  console.log('---');
});

console.log("\n=== REGEX VALIDATION FAILED ===");
result.regexChecks.failed.forEach(check => {
  console.log(`Path: ${check.path}`);
  console.log(`Value: ${check.value}`);
  console.log(`Pattern: ${check.pattern}`);
  console.log(`Message: ${check.message}`);
  console.log(`Matched by name: ${check.matchedByName ? 'Yes' : 'No'}`);
  console.log('---');
});

console.log("\n=== SUMMARY ===");
console.log(`Total regex checks: ${result.summary.totalRegexChecks}`);
console.log(`Passed: ${result.regexChecks.passed.length}`);
console.log(`Failed: ${result.regexChecks.failed.length}`);