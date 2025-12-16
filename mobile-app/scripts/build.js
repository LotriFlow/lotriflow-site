const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const rootDir = path.join(__dirname, '../');
const capacitorJsPath = path.join(rootDir, 'node_modules', '@capacitor', 'core', 'dist', 'capacitor.js');
const capacitorJsDest = path.join(distDir, 'capacitor.js');

// Files/Dirs to copy
const itemsToCopy = [
    'index.html',
    'manifest.json',
    'sw.js',
    'src',
    'assets',
    'milestone-styles.css'
];

// Ensure dist exists
if (!fs.existsSync(distDir)){
    fs.mkdirSync(distDir);
}

// Clean dist (optional, simple version just overwrites)

console.log('Building LotriFlow Quit for Capacitor...');

itemsToCopy.forEach(item => {
    const srcPath = path.join(rootDir, item);
    const destPath = path.join(distDir, item);

    if (fs.existsSync(srcPath)) {
        console.log(`Copying ${item}...`);
        fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
        console.warn(`Warning: ${item} not found.`);
    }
});

// Copy Capacitor runtime for native builds
if (fs.existsSync(capacitorJsPath)) {
    fs.copyFileSync(capacitorJsPath, capacitorJsDest);
    console.log('Copying capacitor.js...');
} else {
    console.warn('Warning: capacitor.js not found in node_modules/@capacitor/core/dist.');
}

console.log('Build complete! Files are in /dist');
