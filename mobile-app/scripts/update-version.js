#!/usr/bin/env node

/**
 * Update Version Script
 * Automatically syncs version and build numbers across all project files
 *
 * Usage:
 *   node scripts/update-version.js --bump-build    # Increment build number
 *   node scripts/update-version.js --version 1.0.7 # Set specific version
 *   node scripts/update-version.js --build 10      # Set specific build number
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const xcodeProjectPath = path.join(rootDir, 'ios/App/App.xcodeproj/project.pbxproj');
const androidBuildGradlePath = path.join(rootDir, 'android/app/build.gradle');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Parse command line arguments
const args = process.argv.slice(2);
let newVersion = packageJson.version;
let newBuild = packageJson.buildNumber;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--bump-build') {
    newBuild = String(parseInt(newBuild) + 1);
  } else if (args[i] === '--version' && args[i + 1]) {
    newVersion = args[i + 1];
    i++;
  } else if (args[i] === '--build' && args[i + 1]) {
    newBuild = args[i + 1];
    i++;
  }
}

// Update package.json
packageJson.version = newVersion;
packageJson.buildNumber = newBuild;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');

// Update Xcode project
if (fs.existsSync(xcodeProjectPath)) {
  let xcodeContent = fs.readFileSync(xcodeProjectPath, 'utf8');

  // Update CURRENT_PROJECT_VERSION
  xcodeContent = xcodeContent.replace(
    /CURRENT_PROJECT_VERSION = \d+;/g,
    `CURRENT_PROJECT_VERSION = ${newBuild};`
  );

  // Update MARKETING_VERSION (only for the main app target)
  const oldVersion = packageJson.version === newVersion ?
    `MARKETING_VERSION = ${packageJson.version};` :
    /MARKETING_VERSION = [\d.]+;/;

  // Only update the main app MARKETING_VERSION (the ones that are not 1.0)
  xcodeContent = xcodeContent.replace(
    /MARKETING_VERSION = 1\.0\.\d+;/g,
    `MARKETING_VERSION = ${newVersion};`
  );

  fs.writeFileSync(xcodeProjectPath, xcodeContent, 'utf8');
}

// Update Android build.gradle
if (fs.existsSync(androidBuildGradlePath)) {
  let androidContent = fs.readFileSync(androidBuildGradlePath, 'utf8');

  // Update versionCode
  androidContent = androidContent.replace(
    /versionCode \d+/,
    `versionCode ${newBuild}`
  );

  // Update versionName
  androidContent = androidContent.replace(
    /versionName "[\d.]+"/,
    `versionName "${newVersion}"`
  );

  fs.writeFileSync(androidBuildGradlePath, androidContent, 'utf8');
}

console.log(`✅ Version updated to ${newVersion} (build ${newBuild})`);
console.log(`📦 Updated files:`);
console.log(`   - package.json`);
if (fs.existsSync(xcodeProjectPath)) {
  console.log(`   - ios/App/App.xcodeproj/project.pbxproj`);
}
if (fs.existsSync(androidBuildGradlePath)) {
  console.log(`   - android/app/build.gradle`);
}
