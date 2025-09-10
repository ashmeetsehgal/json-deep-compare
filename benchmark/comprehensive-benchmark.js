#!/usr/bin/env node

/**
 * Comprehensive Performance Benchmark
 * 
 * This script provides a complete analysis of json-deep-compare performance
 * including feature comparisons and realistic use case scenarios.
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// Import our library
const JSONCompare = require('../dist/cjs/index.js').default;

// Try to import real libraries
let lodashIsEqual, deepEqual, hasRealLibraries = false;

try {
  const _ = require('lodash');
  lodashIsEqual = _.isEqual;
  hasRealLibraries = true;
  console.log('✅ Using real lodash.isEqual');
} catch (e) {
  console.log('⚠️  lodash not found, using fallback');
  lodashIsEqual = require('./fallback-lodash');
}

try {
  deepEqual = require('deep-equal');
  hasRealLibraries = true;
  console.log('✅ Using real deep-equal');
} catch (e) {
  console.log('⚠️  deep-equal not found, using fallback');
  deepEqual = require('./fallback-deep-equal');
}

// Test data generators
class TestDataGenerator {
  static generateAPIResponse() {
    return {
      users: Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        active: i % 2 === 0,
        profile: {
          age: 20 + (i % 50),
          city: `City ${i % 10}`,
          preferences: {
            theme: ['light', 'dark'][i % 2],
            notifications: true
          }
        },
        createdAt: new Date().toISOString(),
        lastLogin: new Date(Date.now() - Math.random() * 86400000).toISOString()
      })),
      meta: {
        total: 50,
        page: 1,
        limit: 50,
        timestamp: Date.now()
      }
    };
  }

  static generateConfigObject() {
    return {
      database: {
        host: 'localhost',
        port: 5432,
        name: 'myapp',
        ssl: true,
        connectionString: 'postgresql://user:pass@localhost:5432/myapp'
      },
      server: {
        port: 3000,
        host: '0.0.0.0',
        ssl: {
          cert: '/path/to/cert.pem',
          key: '/path/to/key.pem'
        }
      },
      api: {
        version: 'v1',
        rateLimit: 1000,
        timeout: 30000
      },
      cache: {
        ttl: 3600,
        maxSize: 1000,
        type: 'redis'
      }
    };
  }

  static generateLargeDataset() {
    const data = { records: [] };
    for (let i = 0; i < 1000; i++) {
      data.records.push({
        id: i,
        name: `Record ${i}`,
        value: Math.random() * 1000,
        metadata: {
          created: new Date().toISOString(),
          tags: [`tag${i % 10}`, `category${i % 5}`],
          nested: {
            level1: {
              level2: {
                data: `nested${i}`,
                array: [1, 2, 3, i]
              }
            }
          }
        }
      });
    }
    return data;
  }
}

// Benchmark class
class ComprehensiveBenchmark {
  constructor() {
    this.results = {};
  }

  benchmark(name, fn, iterations = 10000) {
    // Warmup
    for (let i = 0; i < 1000; i++) {
      fn();
    }
    
    // Actual benchmark
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    const end = performance.now();
    
    return (end - start) / iterations;
  }

  async runAllBenchmarks() {
    console.log('🚀 Comprehensive Performance Benchmark\n');
    console.log(`Environment: Node ${process.version}, ${process.platform} ${process.arch}`);
    console.log(`Real libraries available: ${hasRealLibraries ? 'Yes' : 'No (using fallbacks)'}\n`);

    // Test 1: Basic Comparison
    await this.runBasicComparisonBenchmark();
    
    // Test 2: Feature-Rich Comparison
    await this.runFeatureRichBenchmark();
    
    // Test 3: Real-world API Response
    await this.runAPIResponseBenchmark();
    
    // Test 4: Configuration Validation
    await this.runConfigValidationBenchmark();
    
    // Test 5: Large Dataset
    await this.runLargeDatasetBenchmark();
    
    // Generate comprehensive report
    this.generateComprehensiveReport();
  }

  async runBasicComparisonBenchmark() {
    console.log('📊 Test 1: Basic Object Comparison');
    
    const obj1 = TestDataGenerator.generateAPIResponse();
    const obj2 = TestDataGenerator.generateAPIResponse();
    
    const jdcTime = this.benchmark('json-deep-compare', () => {
      const comparator = new JSONCompare();
      return comparator.compare(obj1, obj2);
    });
    
    const lodashTime = this.benchmark('lodash.isEqual', () => {
      return lodashIsEqual(obj1, obj2);
    });
    
    const deepEqualTime = this.benchmark('deep-equal', () => {
      return deepEqual(obj1, obj2);
    });
    
    this.results.basicComparison = {
      'json-deep-compare': jdcTime,
      'lodash.isEqual': lodashTime,
      'deep-equal': deepEqualTime
    };
    
    console.log(`   json-deep-compare: ${jdcTime.toFixed(3)}ms`);
    console.log(`   lodash.isEqual:    ${lodashTime.toFixed(3)}ms`);
    console.log(`   deep-equal:        ${deepEqualTime.toFixed(3)}ms`);
    console.log(`   Winner: ${jdcTime < Math.min(lodashTime, deepEqualTime) ? '🏆 json-deep-compare' : '❌ Other'}\n`);
  }

  async runFeatureRichBenchmark() {
    console.log('📊 Test 2: Feature-Rich Comparison (Regex + Type Checking)');
    
    const obj1 = TestDataGenerator.generateAPIResponse();
    const obj2 = TestDataGenerator.generateAPIResponse();
    
    const jdcTime = this.benchmark('json-deep-compare', () => {
      const comparator = new JSONCompare({
        regexChecks: {
          'users[*].email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          'users[*].createdAt': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
          'meta.timestamp': /^\d+$/
        },
        strictTypes: true
      });
      return comparator.compareAndValidate(obj1, obj2);
    });
    
    // Other libraries can't do regex validation, so we just do basic comparison
    const lodashTime = this.benchmark('lodash.isEqual', () => {
      return lodashIsEqual(obj1, obj2);
    });
    
    const deepEqualTime = this.benchmark('deep-equal', () => {
      return deepEqual(obj1, obj2);
    });
    
    this.results.featureRich = {
      'json-deep-compare': jdcTime,
      'lodash.isEqual': lodashTime,
      'deep-equal': deepEqualTime
    };
    
    console.log(`   json-deep-compare: ${jdcTime.toFixed(3)}ms (with regex + type checking)`);
    console.log(`   lodash.isEqual:    ${lodashTime.toFixed(3)}ms (basic comparison only)`);
    console.log(`   deep-equal:        ${deepEqualTime.toFixed(3)}ms (basic comparison only)`);
    console.log(`   Winner: 🏆 json-deep-compare (only library with these features)\n`);
  }

  async runAPIResponseBenchmark() {
    console.log('📊 Test 3: API Response Validation');
    
    const response = TestDataGenerator.generateAPIResponse();
    const expected = TestDataGenerator.generateAPIResponse();
    
    const jdcTime = this.benchmark('json-deep-compare', () => {
      const comparator = new JSONCompare({
        regexChecks: {
          'users[*].email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          'users[*].createdAt': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
          'users[*].lastLogin': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
        },
        ignoredKeys: ['meta.timestamp']
      });
      return comparator.compareAndValidate(expected, response);
    }, 1000);
    
    const lodashTime = this.benchmark('lodash.isEqual', () => {
      // Remove timestamp for fair comparison
      const responseCopy = JSON.parse(JSON.stringify(response));
      const expectedCopy = JSON.parse(JSON.stringify(expected));
      delete responseCopy.meta.timestamp;
      delete expectedCopy.meta.timestamp;
      return lodashIsEqual(expectedCopy, responseCopy);
    }, 1000);
    
    const deepEqualTime = this.benchmark('deep-equal', () => {
      const responseCopy = JSON.parse(JSON.stringify(response));
      const expectedCopy = JSON.parse(JSON.stringify(expected));
      delete responseCopy.meta.timestamp;
      delete expectedCopy.meta.timestamp;
      return deepEqual(expectedCopy, responseCopy);
    }, 1000);
    
    this.results.apiResponse = {
      'json-deep-compare': jdcTime,
      'lodash.isEqual': lodashTime,
      'deep-equal': deepEqualTime
    };
    
    console.log(`   json-deep-compare: ${jdcTime.toFixed(3)}ms (with validation)`);
    console.log(`   lodash.isEqual:    ${lodashTime.toFixed(3)}ms (manual preprocessing)`);
    console.log(`   deep-equal:        ${deepEqualTime.toFixed(3)}ms (manual preprocessing)`);
    console.log(`   Winner: ${jdcTime < Math.min(lodashTime, deepEqualTime) ? '🏆 json-deep-compare' : '❌ Other'}\n`);
  }

  async runConfigValidationBenchmark() {
    console.log('📊 Test 4: Configuration Validation');
    
    const config = TestDataGenerator.generateConfigObject();
    const expected = TestDataGenerator.generateConfigObject();
    
    const jdcTime = this.benchmark('json-deep-compare', () => {
      const comparator = new JSONCompare({
        regexChecks: {
          'database.host': /^[a-zA-Z0-9.-]+$/,
          'database.port': /^\d{1,5}$/,
          'server.ssl.cert': /\.pem$/,
          'api.version': /^v\d+$/,
          'cache.ttl': /^\d+$/
        }
      });
      return comparator.compareAndValidate(expected, config);
    }, 1000);
    
    const lodashTime = this.benchmark('lodash.isEqual', () => {
      return lodashIsEqual(expected, config);
    }, 1000);
    
    const deepEqualTime = this.benchmark('deep-equal', () => {
      return deepEqual(expected, config);
    }, 1000);
    
    this.results.configValidation = {
      'json-deep-compare': jdcTime,
      'lodash.isEqual': lodashTime,
      'deep-equal': deepEqualTime
    };
    
    console.log(`   json-deep-compare: ${jdcTime.toFixed(3)}ms (with regex validation)`);
    console.log(`   lodash.isEqual:    ${lodashTime.toFixed(3)}ms (no validation)`);
    console.log(`   deep-equal:        ${deepEqualTime.toFixed(3)}ms (no validation)`);
    console.log(`   Winner: 🏆 json-deep-compare (only library with validation)\n`);
  }

  async runLargeDatasetBenchmark() {
    console.log('📊 Test 5: Large Dataset Comparison');
    
    const dataset1 = TestDataGenerator.generateLargeDataset();
    const dataset2 = TestDataGenerator.generateLargeDataset();
    
    const jdcTime = this.benchmark('json-deep-compare', () => {
      const comparator = new JSONCompare();
      return comparator.compare(dataset1, dataset2);
    }, 100);
    
    const lodashTime = this.benchmark('lodash.isEqual', () => {
      return lodashIsEqual(dataset1, dataset2);
    }, 100);
    
    const deepEqualTime = this.benchmark('deep-equal', () => {
      return deepEqual(dataset1, dataset2);
    }, 100);
    
    this.results.largeDataset = {
      'json-deep-compare': jdcTime,
      'lodash.isEqual': lodashTime,
      'deep-equal': deepEqualTime
    };
    
    console.log(`   json-deep-compare: ${jdcTime.toFixed(3)}ms`);
    console.log(`   lodash.isEqual:    ${lodashTime.toFixed(3)}ms`);
    console.log(`   deep-equal:        ${deepEqualTime.toFixed(3)}ms`);
    console.log(`   Winner: ${jdcTime < Math.min(lodashTime, deepEqualTime) ? '🏆 json-deep-compare' : '❌ Other'}\n`);
  }

  generateComprehensiveReport() {
    console.log('📋 COMPREHENSIVE BENCHMARK REPORT');
    console.log('=' .repeat(80));
    
    // Performance table
    console.log('\n📊 Performance Results:');
    console.log('-' .repeat(50));
    
    const table = [
      ['Test Case', 'json-deep-compare', 'lodash.isEqual', 'deep-equal', 'Notes'],
      ['-' .repeat(12), '-' .repeat(18), '-' .repeat(14), '-' .repeat(12), '-' .repeat(30)]
    ];
    
    Object.entries(this.results).forEach(([testName, results]) => {
      const jdc = results['json-deep-compare'].toFixed(3);
      const lodash = results['lodash.isEqual'].toFixed(3);
      const deep = results['deep-equal'].toFixed(3);
      
      let notes = '';
      if (testName === 'featureRich' || testName === 'configValidation') {
        notes = 'Only jdc has validation';
      } else if (testName === 'apiResponse') {
        notes = 'jdc has built-in validation';
      }
      
      table.push([testName, `${jdc}ms`, `${lodash}ms`, `${deep}ms`, notes]);
    });
    
    table.forEach(row => {
      console.log(`| ${row[0].padEnd(12)} | ${row[1].padEnd(16)} | ${row[2].padEnd(12)} | ${row[3].padEnd(10)} | ${row[4].padEnd(28)} |`);
    });
    
    // Feature comparison
    console.log('\n🔍 Feature Comparison:');
    console.log('-' .repeat(30));
    
    const features = [
      ['Feature', 'json-deep-compare', 'lodash.isEqual', 'deep-equal'],
      ['-' .repeat(20), '-' .repeat(18), '-' .repeat(14), '-' .repeat(12)],
      ['Basic Comparison', '✅', '✅', '✅'],
      ['Regex Validation', '✅', '❌', '❌'],
      ['Type Checking', '✅', '❌', '❌'],
      ['Detailed Results', '✅', '❌', '❌'],
      ['Custom Rules', '✅', '❌', '❌'],
      ['Path Information', '✅', '❌', '❌'],
      ['Zero Dependencies', '✅', '❌', '✅'],
      ['TypeScript Support', '✅', '✅', '❌']
    ];
    
    features.forEach(row => {
      console.log(`| ${row[0].padEnd(18)} | ${row[1].padEnd(16)} | ${row[2].padEnd(12)} | ${row[3].padEnd(10)} |`);
    });
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log('-' .repeat(20));
    
    const basicWinner = this.results.basicComparison['json-deep-compare'] < 
      Math.min(this.results.basicComparison['lodash.isEqual'], this.results.basicComparison['deep-equal']);
    
    if (basicWinner) {
      console.log('✅ json-deep-compare is faster for basic comparisons');
    } else {
      console.log('⚠️  Other libraries are faster for basic comparisons');
      console.log('   → Focus on unique features (regex validation, detailed results)');
    }
    
    console.log('✅ json-deep-compare is the only library with regex validation');
    console.log('✅ json-deep-compare provides detailed comparison results');
    console.log('✅ json-deep-compare has zero dependencies');
    
    // Save results
    this.saveResults();
  }

  saveResults() {
    const resultsPath = path.join(__dirname, 'comprehensive-results.json');
    const report = {
      timestamp: new Date().toISOString(),
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        realLibraries: hasRealLibraries
      },
      results: this.results,
      summary: {
        basicComparisonWinner: this.results.basicComparison['json-deep-compare'] < 
          Math.min(this.results.basicComparison['lodash.isEqual'], this.results.basicComparison['deep-equal']),
        uniqueFeatures: ['regex-validation', 'detailed-results', 'type-checking', 'custom-rules'],
        recommendations: [
          'Emphasize unique features over raw performance',
          'Position as feature-rich comparison library',
          'Highlight enterprise-grade validation capabilities'
        ]
      }
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Comprehensive results saved to: ${resultsPath}`);
  }
}

// Run benchmarks if this file is executed directly
if (require.main === module) {
  const benchmark = new ComprehensiveBenchmark();
  benchmark.runAllBenchmarks().catch(console.error);
}

module.exports = { ComprehensiveBenchmark, TestDataGenerator };
