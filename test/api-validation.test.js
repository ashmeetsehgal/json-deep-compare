/**
 * @fileoverview Unit tests for API response validation using JSONCompare
 */

const JSONCompare = require('../index');

describe('API Response Validation Tests', () => {
  // Common test objects
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

  // Test 1: Basic API response validation
  test('Should detect differences in API responses', () => {
    const actualApiResponse = {
      success: true,
      data: {
        user: {
          id: "12345",
          name: "John Doe", 
          email: "john@example.com",
          role: "admin", // Different from expected
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

    const comparator = new JSONCompare();
    const result = comparator.compare(expectedApiResponse, actualApiResponse);
    
    expect(result.summary.matchPercentage).toBeLessThan(100);
    expect(result.unmatched.values.length).toBe(1);
    expect(result.unmatched.values[0].path).toBe('data.user.role');
    expect(result.unmatched.values[0].expected).toBe('user');
    expect(result.unmatched.values[0].actual).toBe('admin');
  });

  // Test 2: API response with extra fields
  test('Should detect extra fields in API response', () => {
    const actualApiResponse = {
      success: true,
      data: {
        user: {
          id: "12345",
          name: "John Doe", 
          email: "john@example.com",
          role: "user",
          createdAt: "2025-01-15T08:30:00Z",
          lastLogin: "2025-04-01T14:22:10Z" // Extra field
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

    const comparator = new JSONCompare({
      ignoreExtraKeys: false
    });
    const result = comparator.compare(expectedApiResponse, actualApiResponse);
    
    expect(result.summary.matchPercentage).toBeLessThan(100);
    expect(result.unmatched.keys.length).toBe(1);
    expect(result.unmatched.keys[0].path).toBe('data.user.lastLogin');
    expect(result.unmatched.keys[0].message).toContain('exists in object 2 but not in object 1');
  });

  // Test 3: API response with different array elements
  test('Should detect differences in array elements', () => {
    const actualApiResponse = {
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
          features: ["advanced-reports", "api-access", "custom-branding"], // Different element
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

    const comparator = new JSONCompare();
    const result = comparator.compare(expectedApiResponse, actualApiResponse);
    
    expect(result.summary.matchPercentage).toBeLessThan(100);
    expect(result.unmatched.values.some(diff => diff.path.includes('features'))).toBeTruthy();
  });

  // Test 4: Test with numeric string equivalence
  test('Should handle numeric string equivalence with appropriate options', () => {
    const actualApiResponse = {
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
            storage: "100", // String instead of number
            apiCalls: 10000
          }
        }
      },
      meta: {
        requestId: "req-123456",
        timestamp: "2025-04-02T10:30:00Z"
      }
    };

    // Test with strict types
    const strictComparator = new JSONCompare({
      strictTypes: true
    });
    const strictResult = strictComparator.compare(expectedApiResponse, actualApiResponse);
    expect(strictResult.unmatched.types.length).toBeGreaterThan(0);
    
    // Test with equivalent values
    const flexibleComparator = new JSONCompare({
      strictTypes: false,
      equivalentValues: {
        'numericValues': [100, '100', 100.0]
      }
    });
    const flexibleResult = flexibleComparator.compare(expectedApiResponse, actualApiResponse);
    expect(flexibleResult.summary.matchPercentage).toBe(100);
  });

  // Test 5: Test ignored keys
  test('Should properly ignore specified keys', () => {
    const actualApiResponse = {
      success: true,
      data: {
        user: {
          id: "12345",
          name: "John Doe", 
          email: "john@example.com",
          role: "user",
          createdAt: "2025-02-15T08:30:00Z" // Different timestamp
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
        timestamp: "2025-04-03T10:30:00Z" // Different timestamp
      }
    };

    // Without ignored keys
    const standardComparator = new JSONCompare();
    const standardResult = standardComparator.compare(expectedApiResponse, actualApiResponse);
    expect(standardResult.summary.matchPercentage).toBeLessThan(100);
    
    // With ignored keys
    const ignoringComparator = new JSONCompare({
      ignoredKeys: ['timestamp', 'createdAt']
    });
    const ignoringResult = ignoringComparator.compare(expectedApiResponse, actualApiResponse);
    expect(ignoringResult.summary.matchPercentage).toBe(100);
  });

  // Test 6: Test regex validation
  test('Should validate field formats using regex', () => {
    const actualApiResponse = {
      success: true,
      data: {
        user: {
          id: "12345",
          name: "John Doe", 
          email: "invalid-email", // Invalid email format
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
        requestId: "invalid-id", // Invalid requestId format
        timestamp: "2025-04-02T10:30:00Z"
      }
    };

    const regexComparator = new JSONCompare({
      regexChecks: {
        'email': /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'requestId': /^req-\d+$/
      },
      matchKeysByName: true
    });
    
    const result = regexComparator.compare(expectedApiResponse, actualApiResponse);
    
    expect(result.regexChecks.failed.length).toBe(2);
    expect(result.regexChecks.failed.some(check => check.path.includes('email'))).toBeTruthy();
    expect(result.regexChecks.failed.some(check => check.path.includes('requestId'))).toBeTruthy();
  });

  // Test 7: Full API validation with all options
  test('Should perform complete API validation with all options', () => {
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
      ignoredKeys: ['timestamp', 'createdAt'],
      
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

    const result = apiValidator.compare(expectedApiResponse, actualApiResponse);
    
    // Check overall results
    expect(result.summary.matchPercentage).toBeLessThan(100);
    
    // Check for unmatched values (role and features)
    expect(result.unmatched.values.length).toBeGreaterThan(0);
    expect(result.unmatched.values.some(diff => diff.path === 'data.user.role')).toBeTruthy();
    
    // Check for extra keys
    expect(result.unmatched.keys.length).toBeGreaterThan(0);
    expect(result.unmatched.keys.some(key => key.path === 'data.user.lastLogin')).toBeTruthy();
    
    // Regex should pass for email but fail for requestId
    expect(result.regexChecks.passed.some(check => check.path.includes('email'))).toBeTruthy();
    expect(result.regexChecks.passed.some(check => check.path.includes('requestId'))).toBeTruthy();
  });
});