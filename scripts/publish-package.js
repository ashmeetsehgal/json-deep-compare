#!/usr/bin/env node

/**
 * Script to publish package to npm
 * Usage: node scripts/publish-package.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const packagePath = path.join(__dirname, '..', 'package.json');

// Parse arguments
const isDryRun = process.argv.includes('--dry-run');

// Read the original package.json
const originalPackage = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const backupPath = `${packagePath}.backup`;

// Create a backup of the original package.json
fs.writeFileSync(backupPath, JSON.stringify(originalPackage, null, 2));

// Function to restore the original package.json
function restoreOriginalPackage() {
  if (fs.existsSync(backupPath)) {
    console.log('Restoring original package.json...');
    fs.copyFileSync(backupPath, packagePath);
    fs.unlinkSync(backupPath);
  }
}

// Handle process termination to ensure we restore the package.json
process.on('SIGINT', () => {
  restoreOriginalPackage();
  process.exit(1);
});

// Run the build process with the original package.json
function buildPackage() {
  try {
    console.log('Building package...');
    fs.writeFileSync(packagePath, JSON.stringify(originalPackage, null, 2));
    if (!isDryRun) {
      execSync('npm run build:full', { stdio: 'inherit' });
    } else {
      console.log('[DRY RUN] Would execute: npm run build:full');
    }
    return true;
  } catch (error) {
    console.error('❌ Failed to build package:', error.message);
    return false;
  }
}

// Function to publish to npm
function publishToNpm() {
  try {
    console.log('Publishing to npm registry...');
    
    // Use the original package data
    fs.writeFileSync(packagePath, JSON.stringify(originalPackage, null, 2));
    
    // Run npm publish
    if (!isDryRun) {
      execSync('npm publish', { stdio: 'inherit' });
    } else {
      console.log('[DRY RUN] Would execute: npm publish');
      console.log('[DRY RUN] Package details:');
      console.log(`  - Name: ${originalPackage.name}`);
      console.log(`  - Version: ${originalPackage.version}`);
      console.log(`  - Registry: default npm registry`);
    }
    
    console.log('✅ Successfully published to npm!');
    return true;
  } catch (error) {
    console.error('❌ Failed to publish to npm:', error.message);
    return false;
  }
}

// Function to update package-lock.json if it exists
function updatePackageLock() {
  const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
  if (fs.existsSync(packageLockPath) && !isDryRun) {
    console.log('Updating package-lock.json...');
    execSync('npm install --package-lock-only', { stdio: 'inherit' });
  } else if (isDryRun && fs.existsSync(packageLockPath)) {
    console.log('[DRY RUN] Would update package-lock.json');
  }
}

// Main function
async function main() {
  console.log('Starting publish script');
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No actual publishing will occur');
  }
  
  try {
    // Build with the original configuration first
    console.log('Starting build process...');
    const buildSuccess = buildPackage();
    if (!buildSuccess) {
      console.error('❌ Build failed. Cannot proceed with publishing.');
      return;
    }
    
    console.log('Starting npm publishing process...');
    const npmSuccess = publishToNpm();
    
    if (npmSuccess) {
      console.log('🎉 Publishing task completed successfully!');
    } else {
      console.log('⚠️ Publishing task failed. Check the logs above.');
    }
  } finally {
    // Always restore the original package.json
    restoreOriginalPackage();
    updatePackageLock();
  }
}

main().catch(error => {
  console.error('An unexpected error occurred:', error);
  restoreOriginalPackage();
  process.exit(1);
});
