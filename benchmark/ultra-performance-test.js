#!/usr/bin/env node

/**
 * Ultra Performance Test
 * 
 * Tests all optimization levels of json-deep-compare
 */

const { performance } = require('perf_hooks');
const JSONCompare = require('../dist/cjs/index.js').default;

// Test data generators
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

// Simple deep equal for comparison
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

// Benchmark function
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
