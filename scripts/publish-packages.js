#!/usr/bin/env node

/**
 * Script to publish packages to both npm and GitHub Packages
 * Usage: node scripts/publish-packages.js [npm|github|both] [--dry-run]
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
    console.log('Building package with original configuration...');
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
    
    // Use the original package data (unscoped name)
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

// Function to publish to GitHub Packages
function publishToGitHub() {
  try {
    console.log('Publishing to GitHub Packages...');
    
    // Create GitHub-specific package.json with scoped name
    const githubPackage = { ...originalPackage };
    const githubUsername = originalPackage.repository.url.split('/').slice(-2)[0].replace('.git', '');
    githubPackage.name = `@${githubUsername}/${originalPackage.name}`;
    githubPackage.publishConfig = {
      registry: 'https://npm.pkg.github.com'
    };
    
    // Write the modified package.json
    fs.writeFileSync(packagePath, JSON.stringify(githubPackage, null, 2));
    
    // Ensure GitHub token is set
    if (!process.env.GITHUB_TOKEN && !isDryRun) {
      console.error('❌ GITHUB_TOKEN environment variable is not set. Please set it before publishing.');
      return false;
    }
    
    // Run npm publish - using the dist folder that was built with original config
    if (!isDryRun) {
      execSync('npm publish', { stdio: 'inherit' });
    } else {
      console.log('[DRY RUN] Would execute: npm publish');
      console.log('[DRY RUN] Package details:');
      console.log(`  - Name: ${githubPackage.name}`);
      console.log(`  - Version: ${githubPackage.version}`);
      console.log(`  - Registry: ${githubPackage.publishConfig.registry}`);
    }
    
    console.log('✅ Successfully published to GitHub Packages!');
    return true;
  } catch (error) {
    console.error('❌ Failed to publish to GitHub Packages:', error.message);
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
  // Get the first arg that isn't --dry-run
  const args = process.argv.slice(2).filter(arg => arg !== '--dry-run');
  const target = args[0] || 'both';
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No actual publishing will occur');
  }
  
  try {
    // Always build with the original configuration first
    const buildSuccess = buildPackage();
    if (!buildSuccess) {
      console.error('❌ Build failed. Cannot proceed with publishing.');
      return;
    }
    
    let npmSuccess = true;
    let githubSuccess = true;
    
    if (target === 'both' || target === 'npm') {
      npmSuccess = publishToNpm();
    }
    
    if (target === 'both' || target === 'github') {
      githubSuccess = publishToGitHub();
    }
    
    if (npmSuccess && githubSuccess) {
      console.log('🎉 All publishing tasks completed successfully!');
    } else {
      console.log('⚠️ Some publishing tasks failed. Check the logs above.');
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