/**
 * @fileoverview Example demonstrating TypeScript usage with JSONCompare
 * @author AshmeetSehgal.com
 */

import JSONCompare, { JSONCompareOptions, JSONCompareResult } from '../index';

// Define interfaces for our data structures
interface User {
  id: number | string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  metadata?: {
    lastLogin?: string;
    preferences?: Record<string, any>;
  };
}

interface ApiResponse {
  status: number;
  success: boolean;
  data: {
    user: User;
    sessionInfo: {
      token: string;
      expires: string;
    };
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

// Create test objects
const expectedResponse: ApiResponse = {
  status: 200,
  success: true,
  data: {
    user: {
      id: 5678,
      name: "Alex Johnson",
      email: "alex@example.com",
      role: "admin",
      metadata: {
        lastLogin: "2025-03-30T12:00:00Z",
        preferences: {
          language: "en-US",
          darkMode: true
        }
      }
    },
    sessionInfo: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      expires: "2025-04-15T00:00:00Z"
    }
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 50
  }
};

const actualResponse = {
  status: 200,
  success: true,
  data: {
    user: {
      id: "5678", // String instead of number
      name: "Alex Johnson",
      email: "alex@example.com",
      role: "admin",
      metadata: {
        lastLogin: "2025-03-30T12:00:00Z",
        preferences: {
          language: "en-US",
          darkMode: false // Different value
        }
      }
    },
    sessionInfo: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      expires: "2025-04-15T00:00:00Z" 
    }
  }
  // Missing pagination object
};

// Define options with proper typing
const options: JSONCompareOptions = {
  ignoredKeys: ['token', 'lastLogin'],
  equivalentValues: {
    'ids': [5678, '5678'],
    'booleans': [true, 'true', 1]
  },
  regexChecks: {
    'email': /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'expires': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
  },
  matchKeysByName: true,
  strictTypes: false,
  ignoreExtraKeys: false
};

// Create comparator with typed options
const comparator = new JSONCompare(options);

// Perform comparison with typed result
const result: JSONCompareResult = comparator.compareAndValidate(expectedResponse, actualResponse);

// Type-safe access to results
console.log('\n=== TYPESCRIPT EXAMPLE RESULTS ===');
console.log(`Match percentage: ${result.summary.matchPercentage.toFixed(1)}%`);

// Using TypeScript's type checking for accessing result properties
if (result.unmatched.keys.length > 0) {
  console.log('\nMissing keys:');
  result.unmatched.keys.forEach(key => {
    console.log(`- ${key.path}`);
  });
}

// Type-safe access to unmatched values
const typeMismatches = result.unmatched.types;
if (typeMismatches.length > 0) {
  console.log('\nType mismatches:');
  typeMismatches.forEach(mismatch => {
    console.log(`- ${mismatch.path}: Expected ${mismatch.expected}, got ${mismatch.actual}`);
  });
}

// Handle optional chainings with type safety
const darkModeMatch = result.unmatched.values.find(
  value => value.path === 'data.user.metadata.preferences.darkMode'
);

if (darkModeMatch) {
  console.log('\nDark mode preference mismatch:');
  console.log(`- Expected: ${darkModeMatch.expected} (${typeof darkModeMatch.expected})`);
  console.log(`- Actual: ${darkModeMatch.actual} (${typeof darkModeMatch.actual})`);
}

// Type-safe access to result summary
console.log('\nSummary statistics:');
console.log(`- Total keys compared: ${result.summary.totalKeysCompared}`);
console.log(`- Total matches: ${result.summary.totalMatched}`);
console.log(`- Total unmatches: ${result.summary.totalUnmatched}`);
console.log(`- Total regex checks: ${result.summary.totalRegexChecks}`);