/**
 * @fileoverview Tests to ensure the package can be properly imported and used
 * @author AshmeetSehgal.com
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Module Import Tests', () => {
  const testDir = path.resolve(__dirname, 'temp-test-dir');
  
  beforeAll(() => {
    // Create temporary directory for testing
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });
  
  afterAll(() => {
    // Clean up temporary directory
    if (fs.existsSync(testDir)) {
      fs.rmdirSync(testDir, { recursive: true });
    }
  });
  
  test('CommonJS import works correctly', () => {
    // Skip if build hasn't run
    if (!fs.existsSync(path.resolve(__dirname, '../dist'))) {
      console.warn('dist directory not found, skipping module import test');
      return;
    }
    
    // Create a simple CJS test file
    const testFile = path.join(testDir, 'cjs-import-test.js');
    const distPath = path.resolve(__dirname, '../dist/cjs/index.js');
    const relativePath = path.relative(path.dirname(testFile), distPath).replace(/\\/g, '/');
    
    fs.writeFileSync(
      testFile,
      `
      const JSONCompare = require('${relativePath}');
      
      // Simple test objects
      const obj1 = { name: 'John', age: 30 };
      const obj2 = { name: 'John', age: 30 };
      
      // Create comparator instance
      const comparator = new JSONCompare();
      
      // Test basic matching
      const result = comparator.compare(obj1, obj2);
      
      // Log results
      console.log('Test result:', result.summary.matchPercentage === 100 ? 'PASS' : 'FAIL');
      
      // Exit with code based on test result
      process.exit(result.summary.matchPercentage === 100 ? 0 : 1);
      `
    );
    
    // Run the test file and check for exit code
    try {
      execSync(`node "${testFile}"`, { stdio: 'pipe' });
    } catch (error) {
      throw new Error(`CJS import test failed: ${error.message}`);
    }
  });
  
  test('ESM import syntax can be used in appropriate environments', () => {
    // Skip if build hasn't run
    if (!fs.existsSync(path.resolve(__dirname, '../dist'))) {
      console.warn('dist directory not found, skipping module import test');
      return;
    }
    
    // Create a simple ESM test file
    const testFile = path.join(testDir, 'esm-import-test.mjs');
    const distPath = path.resolve(__dirname, '../dist/esm/index.js');
    const relativePath = path.relative(path.dirname(testFile), distPath).replace(/\\/g, '/');
    
    fs.writeFileSync(
      testFile,
      `
      import JSONCompare from '${relativePath}';
      
      // Simple test objects
      const obj1 = { name: 'John', age: 30 };
      const obj2 = { name: 'John', age: 30 };
      
      // Create comparator instance
      const comparator = new JSONCompare();
      
      // Test basic matching
      const result = comparator.compare(obj1, obj2);
      
      // Log results
      console.log('Test result:', result.summary.matchPercentage === 100 ? 'PASS' : 'FAIL');
      
      // Exit with code based on test result
      process.exit(result.summary.matchPercentage === 100 ? 0 : 1);
      `
    );
    
    // Run the test file and check for exit code
    try {
      execSync(`node --experimental-modules "${testFile}"`, { stdio: 'pipe' });
    } catch (error) {
      throw new Error(`ESM import test failed: ${error.message}`);
    }
  });
  
  test('Package can be used when installed from dist directory', () => {
    // Skip if build hasn't run
    if (!fs.existsSync(path.resolve(__dirname, '../dist'))) {
      console.warn('dist directory not found, skipping package install test');
      return;
    }
    
    const packageDir = path.join(testDir, 'package-test');
    fs.mkdirSync(packageDir, { recursive: true });
    
    // Copy the dist directory to simulate a local install
    const nodeModulesDir = path.join(packageDir, 'node_modules');
    const packageModuleDir = path.join(nodeModulesDir, 'json-deep-compare');
    fs.mkdirSync(packageModuleDir, { recursive: true });
    
    // Copy dist contents to the simulated node_modules path
    execSync(`cp -r "${path.resolve(__dirname, '../dist/')}"/* "${packageModuleDir}/"`);
    
    // Create a simple package.json
    fs.writeFileSync(
      path.join(packageDir, 'package.json'),
      JSON.stringify({
        name: 'test-package',
        version: '1.0.0',
        main: 'index.js',
        type: 'commonjs'
      }, null, 2)
    );
    
    // Create a simple test script
    fs.writeFileSync(
      path.join(packageDir, 'index.js'),
      `
      // This test simulates installing the package
      const JSONCompare = require('json-deep-compare');
      
      // Simple test objects
      const obj1 = { name: 'John', age: 30 };
      const obj2 = { name: 'John', age: 30 };
      
      // Create comparator instance
      const comparator = new JSONCompare();
      
      // Test basic matching
      const result = comparator.compare(obj1, obj2);
      
      // Exit with code based on test result
      process.exit(result.summary.matchPercentage === 100 ? 0 : 1);
      `
    );
    
    // Run the test file and check for exit code
    try {
      execSync(`cd "${packageDir}" && node index.js`, { stdio: 'pipe' });
    } catch (error) {
      throw new Error(`Package install test failed: ${error.message}`);
    }
  });
});