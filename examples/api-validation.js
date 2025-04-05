/**
 * @fileoverview Example demonstrating API response validation using JSONCompare
 * @author AshmeetSehgal.com
 * Try this example online in the interactive playground:
 * https://ashmeetsehgal.com/tools/json-compare
 */

const JSONCompare = require('../index');

// Expected API response structure (schema)
const expectedApiResponse = {
  success: true,
  data: {
    user: {
      id: "12345",
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      createdAt: "2025-01-15T08:30:00Z"
    },
    subscription: {
      plan: "premium",
      startDate: "2025-03-01T00:00:00Z",
      endDate: "2026-03-01T00:00:00Z",
      features: ["advanced-reports", "api-access", "support-24-7"],
      limits: {
        storage: 100,
        apiCalls: 10000
      }
    }
  },
  meta: {
    requestId: "req-123456",
    timestamp: "2025-04-02T10:30:00Z"
  }
};

// Mock actual API response (might come from an actual API call)
const actualApiResponse = {
  success: true,
  data: {
    user: {
      id: "12345",
      name: "John Doe", 
      email: "john@example.com",
      role: "admin", // Different from expected
      createdAt: "2025-01-15T08:30:00Z",
      lastLogin: "2025-04-01T14:22:10Z" // Extra field
    },
    subscription: {
      plan: "premium",
      startDate: "2025-03-01T00:00:00Z",
      endDate: "2026-03-01T00:00:00Z",
      features: ["advanced-reports", "api-access", "custom-branding"], // Different element
      limits: {
        storage: "100", // String instead of number
        apiCalls: 10000
      }
    }
  },
  meta: {
    requestId: "req-789012", // Different from expected
    timestamp: "2025-04-02T10:30:05Z" // Slightly different timestamp
  }
};

// Create validator with custom options specific to API validation
const apiValidator = new JSONCompare({
  // Timestamps can vary slightly, so ignore them
  ignoredKeys: ['timestamp', 'lastLogin', 'createdAt'],
  
  // Numeric values might come as strings from the API
  equivalentValues: {
    'numericValues': [100, '100', 100.0]
  },
  
  // We want to be informed of extra fields but not fail the validation
  ignoreExtraKeys: false,
  
  // Don't be strict about types for API responses
  strictTypes: false,
  
  // Define validation rules for specific fields
  regexChecks: {
    'email': /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'requestId': /^req-\d+$/
  },
  
  // Match keys by name for regex validation
  matchKeysByName: true
});

// Validate the API response
const validationResult = apiValidator.compare(expectedApiResponse, actualApiResponse);

// Display validation results in a user-friendly format
console.log('\n=== API RESPONSE VALIDATION RESULTS ===');
console.log(`Overall match percentage: ${validationResult.summary.matchPercentage.toFixed(2)}%`);

// Check for unmatched values (differences)
if (validationResult.unmatched.values.length > 0) {
  console.log('\n--- FIELD VALUE DIFFERENCES ---');
  validationResult.unmatched.values.forEach(diff => {
    console.log(`Field: ${diff.path}`);
    console.log(`Expected: ${JSON.stringify(diff.expected)}`);
    console.log(`Received: ${JSON.stringify(diff.actual)}`);
    console.log('---');
  });
}

// Check for extra keys in the response
if (validationResult.unmatched.keys.length > 0) {
  console.log('\n--- EXTRA OR MISSING FIELDS ---');
  validationResult.unmatched.keys.forEach(key => {
    console.log(`Field: ${key.path}`);
    console.log(`Value: ${JSON.stringify(key.value)}`);
    console.log(`Note: ${key.message}`);
    console.log('---');
  });
}

// Check if any regex validations failed
if (validationResult.regexChecks.failed.length > 0) {
  console.log('\n--- FAILED FORMAT VALIDATIONS ---');
  validationResult.regexChecks.failed.forEach(check => {
    console.log(`Field: ${check.path}`);
    console.log(`Value: ${check.value}`);
    console.log(`Expected format: ${check.pattern}`);
    console.log(`Error: ${check.message}`);
    console.log('---');
  });
}

// Determine if the API response is valid enough
const isValid = validationResult.summary.matchPercentage >= 90;
console.log(`\nAPI response is ${isValid ? 'VALID ✓' : 'INVALID ✗'} (required: ≥90% match)`);

// Provide suggestions for debugging
if (!isValid) {
  console.log('\n--- DEBUGGING SUGGESTIONS ---');
  console.log('1. Check the "user.role" field - expected "user" but got "admin"');
  console.log('2. Verify the "subscription.features" array elements match the expected values');
  console.log('3. Ensure the "meta.requestId" format follows the expected pattern');
}