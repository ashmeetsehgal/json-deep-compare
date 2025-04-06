/**
 * @fileoverview Tests to ensure package integrity and correct import paths
 * @author AshmeetSehgal.com
 */

const fs = require('fs');
const path = require('path');

describe('Package Integrity Tests', () => {
  test('built CJS files should have correct import paths', () => {
    // This test will run after the build process in CI
    // Check if dist directory exists (if not, skip test assuming build hasn't run yet)
    if (!fs.existsSync(path.resolve(__dirname, '../dist'))) {
      console.warn('dist directory not found, skipping package integrity test');
      return;
    }

    // Check CJS index file for proper import paths
    const cjsIndexPath = path.resolve(__dirname, '../dist/cjs/index.js');
    expect(fs.existsSync(cjsIndexPath)).toBe(true);
    
    const cjsIndexContent = fs.readFileSync(cjsIndexPath, 'utf-8');
    // Modified test to handle minified format which might have quotes and no spaces
    expect(
      cjsIndexContent.includes("require('./JSONCompare')") || 
      cjsIndexContent.includes("require(\"./JSONCompare\")") ||
      cjsIndexContent.includes("require('./JSONCompare')")
    ).toBe(true);
    expect(cjsIndexContent).not.toContain("require('./src/");
    expect(cjsIndexContent).not.toContain("require('../src/");

    // Check other CJS files for improper imports
    const cjsFiles = fs
      .readdirSync(path.resolve(__dirname, '../dist/cjs'))
      .filter(file => file.endsWith('.js'));
    
    for (const file of cjsFiles) {
      const content = fs.readFileSync(path.resolve(__dirname, '../dist/cjs', file), 'utf-8');
      expect(content).not.toContain("require('./src/");
      expect(content).not.toContain("require('../src/");
    }
  });

  test('built ESM files should have correct import paths', () => {
    // Skip if build hasn't run
    if (!fs.existsSync(path.resolve(__dirname, '../dist'))) {
      console.warn('dist directory not found, skipping package integrity test');
      return;
    }

    // Check ESM index file for proper import paths
    const esmIndexPath = path.resolve(__dirname, '../dist/esm/index.js');
    expect(fs.existsSync(esmIndexPath)).toBe(true);
    
    const esmIndexContent = fs.readFileSync(esmIndexPath, 'utf-8');
    // Note: In ESM build the Babel config might output different import syntax,
    // but we still want to ensure no src/ references
    expect(esmIndexContent).not.toContain("'./src/");
    expect(esmIndexContent).not.toContain("\"./src/");
    expect(esmIndexContent).not.toContain("'../src/");
    expect(esmIndexContent).not.toContain("\"../src/");

    // Check other ESM files for improper imports
    const esmFiles = fs
      .readdirSync(path.resolve(__dirname, '../dist/esm'))
      .filter(file => file.endsWith('.js'));
    
    for (const file of esmFiles) {
      const content = fs.readFileSync(path.resolve(__dirname, '../dist/esm', file), 'utf-8');
      expect(content).not.toContain("'./src/");
      expect(content).not.toContain("\"./src/");
      expect(content).not.toContain("'../src/");
      expect(content).not.toContain("\"../src/");
    }
  });

  test('package.json imports and exports are correctly configured', () => {
    const packageJson = require('../package.json');
    
    // Check main field points to CJS build
    expect(packageJson.main).toBe('dist/cjs/index.js');
    
    // Check module field points to ESM build
    expect(packageJson.module).toBe('dist/esm/index.js');
    
    // Check exports condition properly configured
    expect(packageJson.exports).toBeDefined();
    expect(packageJson.exports['.'].import).toBe('./dist/esm/index.js');
    expect(packageJson.exports['.'].require).toBe('./dist/cjs/index.js');
  });

  test('package.json in dist folder has correct configuration', () => {
    // Skip if build hasn't run
    if (!fs.existsSync(path.resolve(__dirname, '../dist/package.json'))) {
      console.warn('dist/package.json not found, skipping test');
      return;
    }

    const distPackageJson = require('../dist/package.json');
    
    // Check it has the same name
    expect(distPackageJson.name).toBe('json-deep-compare');
    
    // Check main field points to CJS build - paths are relative to dist folder
    expect(distPackageJson.main).toBe('./cjs/index.js');
    
    // Check module field points to ESM build - paths are relative to dist folder
    expect(distPackageJson.module).toBe('./esm/index.js');
    
    // Check exports condition properly configured - paths are relative to dist folder
    expect(distPackageJson.exports).toBeDefined();
    expect(distPackageJson.exports['.'].import).toBe('./esm/index.js');
    expect(distPackageJson.exports['.'].require).toBe('./cjs/index.js');
  });
});