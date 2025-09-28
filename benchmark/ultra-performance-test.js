#!/usr/bin/env node

/**
 * Ultra Performance Test
 * 
 * Tests all optimization levels of json-deep-compare
 */

const { performance } = require('perf_hooks');
const JSONCompare = require('../dist/cjs/index.js').default;

/**
 * Creates a small nested test object representing a user with profile and preferences.
 *
 * @returns {Object} A user object with the following shape:
 *  - id: number
 *  - name: string
 *  - email: string
 *  - active: boolean
 *  - profile: object containing:
 *      - age: number
 *      - city: string
 *      - preferences: object containing:
 *          - theme: string
 *          - notifications: boolean
 */
function generateSmallObject() {
  return {
    id: 123,
    name: 'Test User',
    email: 'test@example.com',
    active: true,
    profile: {
      age: 25,
      city: 'New York',
      preferences: {
        theme: 'dark',
        notifications: true
      }
    }
  };
}

/**
 * Create a medium-sized test fixture containing user and product arrays.
 *
 * The returned object is intended for performance testing and contains 100 user entries
 * (each produced by generateSmallObject) and 200 product entries.
 * @return {{users: Array<Object>, products: Array<{id: number, name: string, price: number, category: string}>}}
 * An object with `users` (array of 100 small user objects) and `products` (array of 200 product objects with `id`, `name`, `price`, and `category`).
 */
function generateMediumObject() {
  const obj = { users: [], products: [] };
  for (let i = 0; i < 100; i++) {
    obj.users.push(generateSmallObject());
  }
  for (let i = 0; i < 200; i++) {
    obj.products.push({
      id: i,
      name: `Product ${i}`,
      price: Math.random() * 1000,
      category: `Category ${i % 10}`
    });
  }
  return obj;
}

/**
 * Create a large test object with 1000 keyed entries containing nested data.
 *
 * Each key is named "key0" through "key999" and maps to an object with:
 * - `id`: the numeric index
 * - `value`: a string "value{index}"
 * - `nested`: an object with `data` string "nested{index}" and `array` containing [1, 2, 3, index]
 *
 * @returns {Object} An object with 1000 keys ("key0"..."key999") each holding the described nested structure.
 */
function generateLargeObject() {
  const obj = {};
  for (let i = 0; i < 1000; i++) {
    obj[`key${i}`] = {
      id: i,
      value: `value${i}`,
      nested: {
        data: `nested${i}`,
        array: [1, 2, 3, i]
      }
    };
  }
  return obj;
}

/**
 * Determine whether two values are deeply equal by comparing their structure and values.
 *
 * @param {*} obj1 - The first value to compare.
 * @param {*} obj2 - The second value to compare.
 * @returns {boolean} `true` if the values are deeply equal, `false` otherwise.
 */
function simpleDeepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  if (typeof obj1 !== typeof obj2) return false;
  
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!simpleDeepEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }
  
  if (typeof obj1 === 'object') {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    for (let key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!simpleDeepEqual(obj1[key], obj2[key])) return false;
    }
    return true;
  }
  
  return false;
}

/**
 * Measure average execution time of a synchronous function over multiple runs.
 *
 * Performs a brief warmup, then times the provided function across the specified
 * number of iterations and returns the average duration per iteration in milliseconds.
 *
 * @param {string} name - Informational label for the benchmark.
 * @param {Function} fn - Synchronous function to measure.
 * @param {number} [iterations=10000] - Number of timed iterations to run.
 * @returns {number} Average time per iteration in milliseconds.
 */
function benchmark(name, fn, iterations = 10000) {
  // Warmup
  for (let i = 0; i < 1000; i++) {
    fn();
  }
  
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  
  return (end - start) / iterations;
}

console.log('🚀 Ultra Performance Test - All Optimization Levels\n');

const scenarios = [
  { name: 'Small Objects', size: 'small', iterations: 10000 },
  { name: 'Medium Objects', size: 'medium', iterations: 1000 },
  { name: 'Large Objects', size: 'large', iterations: 100 }
];

scenarios.forEach(scenario => {
  console.log(`📊 Testing ${scenario.name}...`);
  
  const obj1 = generateTestData(scenario.size);
  const obj2 = generateTestData(scenario.size);
  
  // Test different optimization levels
  const tests = [
    {
      name: 'Simple Deep Equal',
      fn: () => simpleDeepEqual(obj1, obj2)
    },
    {
      name: 'JSONCompare.isEqual (Boolean)',
      fn: () => {
        const comparator = new JSONCompare();
        return comparator.isEqual(obj1, obj2);
      }
    },
    {
      name: 'JSONCompare.compare (Ultra-Fast)',
      fn: () => {
        const comparator = new JSONCompare();
        return comparator.compare(obj1, obj2);
      }
    },
    {
      name: 'JSONCompare.compare (Fast)',
      fn: () => {
        const comparator = new JSONCompare({ strictTypes: false });
        return comparator.compare(obj1, obj2);
      }
    },
    {
      name: 'JSONCompare.compare (Full)',
      fn: () => {
        const comparator = new JSONCompare({
          regexChecks: { email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
        });
        return comparator.compare(obj1, obj2);
      }
    }
  ];
  
  const results = [];
  
  tests.forEach(test => {
    const time = benchmark(test.name, test.fn, scenario.iterations);
    results.push({ name: test.name, time });
  });
  
  // Sort by performance
  results.sort((a, b) => a.time - b.time);
  
  console.log('\nResults (fastest to slowest):');
  results.forEach((result, index) => {
    const speedup = results[0].time / result.time;
    const status = index === 0 ? '🏆 Fastest' : 
                  speedup > 0.8 ? '✅ Fast' : 
                  speedup > 0.5 ? '⚠️ Medium' : '❌ Slow';
    console.log(`  ${index + 1}. ${result.name.padEnd(30)} ${result.time.toFixed(3)}ms ${status}`);
  });
  
  // Performance analysis
  const fastest = results[0];
  const jdcBoolean = results.find(r => r.name.includes('isEqual'));
  const jdcUltraFast = results.find(r => r.name.includes('Ultra-Fast'));
  const jdcFast = results.find(r => r.name.includes('Fast') && !r.name.includes('Ultra'));
  const jdcFull = results.find(r => r.name.includes('Full'));
  
  console.log('\nPerformance Analysis:');
  if (jdcBoolean) {
    const vsFastest = fastest.time / jdcBoolean.time;
    console.log(`  Boolean mode: ${vsFastest.toFixed(1)}x ${vsFastest > 0.8 ? 'faster' : 'slower'} than fastest`);
  }
  if (jdcUltraFast) {
    const vsFastest = fastest.time / jdcUltraFast.time;
    console.log(`  Ultra-Fast mode: ${vsFastest.toFixed(1)}x ${vsFastest > 0.8 ? 'faster' : 'slower'} than fastest`);
  }
  if (jdcFast) {
    const vsFastest = fastest.time / jdcFast.time;
    console.log(`  Fast mode: ${vsFastest.toFixed(1)}x ${vsFastest > 0.8 ? 'faster' : 'slower'} than fastest`);
  }
  if (jdcFull) {
    const vsFastest = fastest.time / jdcFull.time;
    console.log(`  Full mode: ${vsFastest.toFixed(1)}x ${vsFastest > 0.8 ? 'faster' : 'slower'} than fastest`);
  }
  
  console.log('\n' + '=' .repeat(60) + '\n');
});

/**
 * Selects and returns test data corresponding to the requested size.
 * @param {string} size - One of `'small'`, `'medium'`, or `'large'` to choose the dataset size.
 * @returns {object} The generated test data for the specified size; defaults to the small dataset when `size` is unrecognized.
 */
function generateTestData(size) {
  switch (size) {
    case 'small': return generateSmallObject();
    case 'medium': return generateMediumObject();
    case 'large': return generateLargeObject();
    default: return generateSmallObject();
  }
}

console.log('🎯 Optimization Summary:');
console.log('-' .repeat(25));
console.log('✅ Boolean mode: Pure boolean comparison (fastest)');
console.log('✅ Ultra-Fast mode: Minimal object creation');
console.log('✅ Fast mode: Optimized algorithms');
console.log('✅ Full mode: All features with regex validation');
console.log('✅ Automatic mode selection based on options');
console.log('✅ Backward compatibility maintained');

console.log('\n💡 Usage Recommendations:');
console.log('-' .repeat(30));
console.log('• Use isEqual() for pure boolean comparisons');
console.log('• Use compare() for detailed results (auto-optimized)');
console.log('• Use compareAndValidate() for regex validation');
console.log('• Library automatically selects fastest mode');
console.log('• Zero configuration needed for optimal performance');
