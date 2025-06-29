# API Testing Guide with json-deep-compare

## Complete Guide to API Response Validation

Learn how to use `json-deep-compare` for robust API testing across various frameworks and use cases.

## Table of Contents

- [Quick Start](#quick-start)
- [Framework Integrations](#framework-integrations)
- [Common API Testing Patterns](#common-api-testing-patterns)
- [Advanced Validation Techniques](#advanced-validation-techniques)
- [Best Practices](#best-practices)
- [Real-World Examples](#real-world-examples)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Basic API Response Validation

```javascript
import JSONCompare from 'json-deep-compare';

// Expected API response structure
const expectedResponse = {
  user: {
    id: 12345,
    email: "user@example.com",
    profile: {
      name: "John Doe",
      verified: true
    }
  },
  timestamp: "2025-01-01T00:00:00Z"
};

// Actual API response
const actualResponse = await fetch('/api/user/12345').then(r => r.json());

// Create validator with API-specific rules
const apiValidator = new JSONCompare({
  regexChecks: {
    'user.email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    'timestamp': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
    'user.id': /^\d+$/
  },
  ignoredKeys: ['requestId', 'serverTime'], // Dynamic fields
  matchKeysByName: true
});

const result = apiValidator.compareAndValidate(expectedResponse, actualResponse);

if (result.summary.matchPercentage === 100) {
  console.log('✅ API response is valid');
} else {
  console.error('❌ API validation failed:', result.unmatched.values);
}
```

## Framework Integrations

### Jest Integration

#### Custom Matcher

```javascript
import JSONCompare from 'json-deep-compare';

expect.extend({
  toMatchApiResponse(received, expected, options = {}) {
    const comparator = new JSONCompare({
      regexChecks: {
        'timestamp': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
        'id': /^\d+$/,
        'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      ignoredKeys: ['requestId', 'serverTime'],
      ...options
    });
    
    const result = comparator.compareAndValidate(expected, received);
    
    if (result.summary.matchPercentage === 100 && result.regexChecks.failed.length === 0) {
      return {
        pass: true,
        message: () => 'API response matches expected structure and validation rules'
      };
    }
    
    const failures = [
      ...result.unmatched.values.map(v => `${v.path}: expected ${v.expected}, got ${v.actual}`),
      ...result.regexChecks.failed.map(f => `${f.path}: "${f.value}" failed regex validation`)
    ];
    
    return {
      pass: false,
      message: () => `API response validation failed:\n${failures.join('\n')}`
    };
  }
});

// Usage in tests
describe('User API', () => {
  test('should return valid user data', async () => {
    const response = await api.getUser(123);
    
    expect(response).toMatchApiResponse({
      id: 123,
      email: expect.any(String),
      profile: {
        name: expect.any(String),
        verified: expect.any(Boolean)
      },
      createdAt: expect.any(String)
    });
  });
  
  test('should validate user creation', async () => {
    const newUser = await api.createUser({ name: 'Jane', email: 'jane@test.com' });
    
    expect(newUser).toMatchApiResponse({
      id: expect.any(Number),
      name: 'Jane',
      email: 'jane@test.com',
      createdAt: expect.any(String)
    }, {
      regexChecks: {
        'createdAt': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      }
    });
  });
});
```

#### Test Helper Functions

```javascript
// api-test-helpers.js
import JSONCompare from 'json-deep-compare';

export class ApiTestHelper {
  constructor(baseConfig = {}) {
    this.defaultConfig = {
      regexChecks: {
        'id': /^\d+$/,
        'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'timestamp': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/,
        'uuid': /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      },
      ignoredKeys: ['requestId', 'serverTime', 'processingTime'],
      matchKeysByName: true,
      ...baseConfig
    };
  }
  
  validateResponse(expected, actual, customConfig = {}) {
    const comparator = new JSONCompare({
      ...this.defaultConfig,
      ...customConfig
    });
    
    return comparator.compareAndValidate(expected, actual);
  }
  
  expectValidResponse(expected, actual, customConfig = {}) {
    const result = this.validateResponse(expected, actual, customConfig);
    
    expect(result.summary.matchPercentage).toBe(100);
    expect(result.regexChecks.failed).toHaveLength(0);
    
    return result;
  }
  
  validatePaginatedResponse(expected, actual) {
    return this.validateResponse(expected, actual, {
      regexChecks: {
        ...this.defaultConfig.regexChecks,
        'meta.total': /^\d+$/,
        'meta.page': /^\d+$/,
        'meta.limit': /^\d+$/
      }
    });
  }
  
  validateErrorResponse(expected, actual) {
    return this.validateResponse(expected, actual, {
      regexChecks: {
        'error.code': /^[A-Z_]+$/,
        'error.message': /^.{1,500}$/,
        'timestamp': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
      }
    });
  }
}

// Usage
const apiHelper = new ApiTestHelper();

test('paginated users endpoint', async () => {
  const response = await api.getUsers({ page: 1, limit: 10 });
  
  apiHelper.expectValidResponse({
    data: expect.any(Array),
    meta: {
      total: expect.any(Number),
      page: 1,
      limit: 10,
      hasNext: expect.any(Boolean)
    }
  }, response);
});
```

### Mocha Integration

```javascript
import { expect } from 'chai';
import JSONCompare from 'json-deep-compare';

describe('API Integration Tests', () => {
  let apiValidator;
  
  beforeEach(() => {
    apiValidator = new JSONCompare({
      regexChecks: {
        'id': /^\d+$/,
        'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'createdAt': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
      },
      ignoredKeys: ['requestId']
    });
  });
  
  it('should validate user profile response', async () => {
    const response = await fetchUserProfile(123);
    
    const expectedStructure = {
      id: 123,
      name: 'John Doe',
      email: 'john@example.com',
      profile: {
        bio: expect.any(String),
        avatar: expect.any(String)
      },
      createdAt: expect.any(String)
    };
    
    const result = apiValidator.compareAndValidate(expectedStructure, response);
    
    expect(result.summary.matchPercentage).to.equal(100);
    expect(result.regexChecks.failed).to.have.length(0);
  });
});
```

### Cypress Integration

```javascript
// cypress/support/commands.js
import JSONCompare from 'json-deep-compare';

Cypress.Commands.add('validateApiResponse', (expected, options = {}) => {
  cy.then((response) => {
    const comparator = new JSONCompare({
      regexChecks: {
        'id': /^\d+$/,
        'timestamp': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
        'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      ignoredKeys: ['requestId', 'serverTime'],
      ...options
    });
    
    const result = comparator.compareAndValidate(expected, response.body);
    
    expect(result.summary.matchPercentage).to.equal(100);
    expect(result.regexChecks.failed).to.have.length(0);
    
    if (result.summary.matchPercentage < 100) {
      cy.log('Validation failures:', result.unmatched.values);
    }
  });
});

// Usage in tests
describe('API Tests', () => {
  it('should validate user creation', () => {
    cy.request('POST', '/api/users', {
      name: 'Test User',
      email: 'test@example.com'
    }).then((response) => {
      cy.validateApiResponse({
        id: expect.any(Number),
        name: 'Test User',
        email: 'test@example.com',
        createdAt: expect.any(String),
        status: 'active'
      });
    });
  });
});
```

### Playwright Integration

```javascript
import { test, expect } from '@playwright/test';
import JSONCompare from 'json-deep-compare';

test.describe('API Tests', () => {
  let apiValidator;
  
  test.beforeEach(() => {
    apiValidator = new JSONCompare({
      regexChecks: {
        'id': /^\d+$/,
        'uuid': /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        'timestamp': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
      }
    });
  });
  
  test('should validate product API response', async ({ request }) => {
    const response = await request.get('/api/products/123');
    const data = await response.json();
    
    const expectedStructure = {
      id: 123,
      name: expect.any(String),
      price: expect.any(Number),
      category: {
        id: expect.any(Number),
        name: expect.any(String)
      },
      createdAt: expect.any(String)
    };
    
    const result = apiValidator.compareAndValidate(expectedStructure, data);
    
    expect(result.summary.matchPercentage).toBe(100);
    expect(result.regexChecks.failed).toHaveLength(0);
  });
});
```

## Common API Testing Patterns

### 1. CRUD Operations Validation

```javascript
class CrudApiTester {
  constructor() {
    this.validator = new JSONCompare({
      regexChecks: {
        'id': /^\d+$/,
        'createdAt': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
        'updatedAt': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
      },
      ignoredKeys: ['serverTime']
    });
  }
  
  async testCreate(endpoint, payload, expectedResponse) {
    const response = await api.post(endpoint, payload);
    const result = this.validator.compareAndValidate(expectedResponse, response);
    
    expect(result.summary.matchPercentage).toBe(100);
    return response;
  }
  
  async testRead(endpoint, expectedResponse) {
    const response = await api.get(endpoint);
    const result = this.validator.compareAndValidate(expectedResponse, response);
    
    expect(result.summary.matchPercentage).toBe(100);
    return response;
  }
  
  async testUpdate(endpoint, payload, expectedResponse) {
    const response = await api.put(endpoint, payload);
    const result = this.validator.compareAndValidate(expectedResponse, response);
    
    expect(result.summary.matchPercentage).toBe(100);
    return response;
  }
  
  async testDelete(endpoint) {
    const response = await api.delete(endpoint);
    expect(response.status).toBe(204);
  }
}
```

### 2. Error Response Validation

```javascript
const errorValidator = new JSONCompare({
  regexChecks: {
    'error.code': /^[A-Z_]{3,50}$/,
    'error.message': /^.{1,500}$/,
    'timestamp': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
    'requestId': /^[a-f0-9-]{36}$/
  }
});

// Test 400 Bad Request
test('should return proper error for invalid input', async () => {
  const response = await api.post('/users', { email: 'invalid-email' });
  
  errorValidator.expectValidResponse({
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid email format',
      details: {
        field: 'email',
        rejectedValue: 'invalid-email'
      }
    },
    timestamp: expect.any(String),
    requestId: expect.any(String)
  }, response);
});
```

### 3. Pagination Validation

```javascript
const paginationValidator = new JSONCompare({
  regexChecks: {
    'meta.total': /^\d+$/,
    'meta.page': /^\d+$/,
    'meta.limit': /^\d+$/,
    'meta.totalPages': /^\d+$/
  }
});

test('should validate paginated response', async () => {
  const response = await api.get('/users?page=1&limit=10');
  
  paginationValidator.expectValidResponse({
    data: expect.any(Array),
    meta: {
      total: expect.any(Number),
      page: 1,
      limit: 10,
      totalPages: expect.any(Number),
      hasNext: expect.any(Boolean),
      hasPrev: false
    }
  }, response);
  
  // Validate each item in the array
  response.data.forEach(user => {
    userValidator.expectValidResponse({
      id: expect.any(Number),
      name: expect.any(String),
      email: expect.any(String)
    }, user);
  });
});
```

## Advanced Validation Techniques

### 1. Dynamic Schema Validation

```javascript
class DynamicApiValidator {
  constructor() {
    this.schemas = new Map();
  }
  
  registerSchema(name, schema, options = {}) {
    this.schemas.set(name, { schema, options });
  }
  
  validate(schemaName, data) {
    const { schema, options } = this.schemas.get(schemaName);
    const validator = new JSONCompare(options);
    return validator.compareAndValidate(schema, data);
  }
}

const validator = new DynamicApiValidator();

// Register schemas
validator.registerSchema('user', {
  id: expect.any(Number),
  name: expect.any(String),
  email: expect.any(String),
  createdAt: expect.any(String)
}, {
  regexChecks: {
    'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    'createdAt': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
  }
});

// Use in tests
test('user API validation', async () => {
  const user = await api.getUser(123);
  const result = validator.validate('user', user);
  expect(result.summary.matchPercentage).toBe(100);
});
```

### 2. Conditional Validation

```javascript
const conditionalValidator = new JSONCompare({
  regexChecks: {
    'id': /^\d+$/,
    'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
});

function validateUserResponse(user, userType) {
  const baseSchema = {
    id: expect.any(Number),
    name: expect.any(String),
    email: expect.any(String)
  };
  
  // Add conditional fields based on user type
  if (userType === 'admin') {
    baseSchema.permissions = expect.any(Array);
    baseSchema.role = 'admin';
  } else if (userType === 'premium') {
    baseSchema.subscription = {
      plan: 'premium',
      expiresAt: expect.any(String)
    };
  }
  
  return conditionalValidator.compareAndValidate(baseSchema, user);
}
```

### 3. Multi-Version API Support

```javascript
class VersionedApiValidator {
  constructor() {
    this.validators = new Map();
    
    // V1 API structure
    this.validators.set('v1', new JSONCompare({
      regexChecks: {
        'id': /^\d+$/,
        'created_at': /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
      }
    }));
    
    // V2 API structure
    this.validators.set('v2', new JSONCompare({
      regexChecks: {
        'id': /^[a-f0-9-]{36}$/,
        'createdAt': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
      }
    }));
  }
  
  validate(version, expected, actual) {
    const validator = this.validators.get(version);
    return validator.compareAndValidate(expected, actual);
  }
}

const versionedValidator = new VersionedApiValidator();

test('should support both API versions', async () => {
  // Test V1
  const v1Response = await api.get('/v1/users/123');
  versionedValidator.validate('v1', {
    id: 123,
    name: 'John',
    created_at: expect.any(String)
  }, v1Response);
  
  // Test V2
  const v2Response = await api.get('/v2/users/550e8400-e29b-41d4-a716-446655440000');
  versionedValidator.validate('v2', {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'John',
    createdAt: expect.any(String)
  }, v2Response);
});
```

## Best Practices

### 1. Organize Validation Rules

```javascript
// api-validation-rules.js
export const API_REGEX_PATTERNS = {
  id: /^\d+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  timestamp: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/,
  phone: /^\+?[1-9]\d{1,14}$/,
  url: /^https?:\/\/.+/
};

export const COMMON_IGNORED_KEYS = [
  'requestId',
  'serverTime',
  'processingTime',
  'trace'
];

export const createApiValidator = (customRules = {}) => {
  return new JSONCompare({
    regexChecks: {
      ...API_REGEX_PATTERNS,
      ...customRules
    },
    ignoredKeys: COMMON_IGNORED_KEYS,
    matchKeysByName: true
  });
};
```

### 2. Reusable Test Utilities

```javascript
// test-utils.js
import { createApiValidator } from './api-validation-rules.js';

export class ApiTestSuite {
  constructor(baseUrl, authToken) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
    this.validator = createApiValidator();
  }
  
  async request(method, endpoint, data = null) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : null
    });
    
    return response.json();
  }
  
  expectValidStructure(expected, actual, customRules = {}) {
    if (Object.keys(customRules).length > 0) {
      const customValidator = createApiValidator(customRules);
      const result = customValidator.compareAndValidate(expected, actual);
      expect(result.summary.matchPercentage).toBe(100);
      return result;
    }
    
    const result = this.validator.compareAndValidate(expected, actual);
    expect(result.summary.matchPercentage).toBe(100);
    return result;
  }
}
```

### 3. Performance Testing with Validation

```javascript
import { performance } from 'perf_hooks';

class PerformanceApiTester {
  constructor() {
    this.validator = createApiValidator();
    this.metrics = [];
  }
  
  async timedRequest(endpoint, expectedSchema) {
    const start = performance.now();
    const response = await api.get(endpoint);
    const requestTime = performance.now() - start;
    
    const validationStart = performance.now();
    const result = this.validator.compareAndValidate(expectedSchema, response);
    const validationTime = performance.now() - validationStart;
    
    this.metrics.push({
      endpoint,
      requestTime,
      validationTime,
      isValid: result.summary.matchPercentage === 100
    });
    
    expect(result.summary.matchPercentage).toBe(100);
    return { response, metrics: { requestTime, validationTime } };
  }
  
  getMetrics() {
    return this.metrics;
  }
}
```

## Real-World Examples

### E-commerce API Testing

```javascript
describe('E-commerce API', () => {
  const ecommerceValidator = new JSONCompare({
    regexChecks: {
      'id': /^\d+$/,
      'sku': /^[A-Z0-9-]{6,20}$/,
      'price': /^\d+\.\d{2}$/,
      'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'orderNumber': /^ORD-\d{8}$/
    },
    ignoredKeys: ['lastSeen', 'serverProcessingTime']
  });
  
  test('product catalog validation', async () => {
    const products = await api.get('/products');
    
    ecommerceValidator.expectValidResponse({
      data: expect.any(Array),
      meta: {
        total: expect.any(Number),
        page: 1,
        limit: 20
      }
    }, products);
    
    // Validate first product
    const firstProduct = products.data[0];
    ecommerceValidator.expectValidResponse({
      id: expect.any(Number),
      name: expect.any(String),
      sku: expect.any(String),
      price: expect.any(String),
      category: {
        id: expect.any(Number),
        name: expect.any(String)
      },
      inStock: expect.any(Boolean)
    }, firstProduct);
  });
  
  test('order creation validation', async () => {
    const order = await api.post('/orders', {
      items: [{ productId: 123, quantity: 2 }],
      customerEmail: 'test@example.com'
    });
    
    ecommerceValidator.expectValidResponse({
      orderNumber: expect.any(String),
      status: 'pending',
      customer: {
        email: 'test@example.com'
      },
      items: [{
        productId: 123,
        quantity: 2,
        price: expect.any(String)
      }],
      total: expect.any(String),
      createdAt: expect.any(String)
    }, order);
  });
});
```

### Social Media API Testing

```javascript
const socialMediaValidator = new JSONCompare({
  regexChecks: {
    'id': /^\d+$/,
    'username': /^[a-zA-Z0-9_]{3,20}$/,
    'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    'hashtag': /^#[a-zA-Z0-9_]+$/,
    'url': /^https?:\/\/.+/
  }
});

describe('Social Media API', () => {
  test('user profile validation', async () => {
    const profile = await api.get('/users/johndoe');
    
    socialMediaValidator.expectValidResponse({
      id: expect.any(Number),
      username: 'johndoe',
      displayName: expect.any(String),
      bio: expect.any(String),
      avatar: expect.any(String),
      followerCount: expect.any(Number),
      followingCount: expect.any(Number),
      verified: expect.any(Boolean),
      joinedAt: expect.any(String)
    }, profile);
  });
  
  test('post creation validation', async () => {
    const post = await api.post('/posts', {
      content: 'Hello world! #firstpost',
      visibility: 'public'
    });
    
    socialMediaValidator.expectValidResponse({
      id: expect.any(Number),
      content: 'Hello world! #firstpost',
      author: {
        id: expect.any(Number),
        username: expect.any(String)
      },
      hashtags: ['#firstpost'],
      likeCount: 0,
      commentCount: 0,
      visibility: 'public',
      createdAt: expect.any(String)
    }, post);
  });
});
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Timestamp Format Mismatches

```javascript
// Problem: Different timestamp formats
const flexibleTimestampValidator = new JSONCompare({
  regexChecks: {
    // Accepts multiple formats
    'timestamp': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
    'createdAt': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/
  },
  equivalentValues: {
    'timestamps': ['2025-01-01T00:00:00Z', '2025-01-01T00:00:00.000Z']
  }
});
```

#### 2. Dynamic Field Values

```javascript
// Problem: Fields with dynamic values
const dynamicFieldValidator = new JSONCompare({
  ignoredKeys: [
    'id',           // Auto-generated
    'timestamp',    // Current time
    'sessionId',    // Random session
    'requestId'     // Request tracking
  ],
  regexChecks: {
    // Validate format instead of exact value
    'version': /^v\d+\.\d+\.\d+$/
  }
});
```

#### 3. Optional Fields

```javascript
// Problem: Optional fields that may or may not be present
function validateWithOptionalFields(expected, actual, optionalFields = []) {
  const validator = new JSONCompare({
    ignoreExtraKeys: true // Ignore fields not in expected
  });
  
  // Remove optional fields from expected if not present in actual
  const filteredExpected = { ...expected };
  optionalFields.forEach(field => {
    if (!(field in actual)) {
      delete filteredExpected[field];
    }
  });
  
  return validator.compareAndValidate(filteredExpected, actual);
}

// Usage
test('user profile with optional fields', async () => {
  const profile = await api.get('/profile');
  
  const result = validateWithOptionalFields({
    id: expect.any(Number),
    name: expect.any(String),
    bio: expect.any(String),        // Optional
    avatar: expect.any(String),     // Optional
    website: expect.any(String)     // Optional
  }, profile, ['bio', 'avatar', 'website']);
  
  expect(result.summary.matchPercentage).toBe(100);
});
```

### Debugging Validation Failures

```javascript
function debugValidationFailure(result) {
  console.log('🔍 Validation Debug Information');
  console.log('=====================================');
  
  if (result.summary.matchPercentage < 100) {
    console.log('❌ Unmatched Values:');
    result.unmatched.values.forEach(v => {
      console.log(`  Path: ${v.path}`);
      console.log(`  Expected: ${JSON.stringify(v.expected)} (${v.expectedType})`);
      console.log(`  Actual: ${JSON.stringify(v.actual)} (${v.actualType})`);
      console.log(`  Message: ${v.message}`);
      console.log('  ---');
    });
  }
  
  if (result.regexChecks.failed.length > 0) {
    console.log('❌ Failed Regex Checks:');
    result.regexChecks.failed.forEach(f => {
      console.log(`  Path: ${f.path}`);
      console.log(`  Value: "${f.value}"`);
      console.log(`  Pattern: ${f.pattern}`);
      console.log('  ---');
    });
  }
  
  if (result.unmatched.keys.length > 0) {
    console.log('❌ Unmatched Keys:');
    result.unmatched.keys.forEach(k => {
      console.log(`  Path: ${k.path}`);
      console.log(`  Message: ${k.message}`);
      console.log('  ---');
    });
  }
  
  console.log(`📊 Summary: ${result.summary.matchPercentage.toFixed(2)}% match`);
}

// Usage in tests
test('debug API validation', async () => {
  const response = await api.get('/complex-endpoint');
  const result = validator.compareAndValidate(expectedSchema, response);
  
  if (result.summary.matchPercentage < 100) {
    debugValidationFailure(result);
  }
  
  expect(result.summary.matchPercentage).toBe(100);
});
```

---

**Related Guides:**
- [Migration Guide](./MIGRATION_GUIDE.md) - Migrate from other testing libraries
- [Performance Benchmarks](./PERFORMANCE_BENCHMARKS.md) - Performance optimization tips
- [Comparison Guide](./COMPARISON_GUIDE.md) - Compare with other libraries

**Community Support:**
- [GitHub Discussions](https://github.com/ashmeetsehgal/json-deep-compare/discussions)
- [Issue Tracker](https://github.com/ashmeetsehgal/json-deep-compare/issues)
- [Interactive Playground](https://ashmeetsehgal.com/tools/json-compare)