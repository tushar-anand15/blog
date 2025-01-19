// checkDependencies.js
const { execSync } = require('child_process');
const fs = require('fs');

function checkAndInstall(packageName) {
  try {
    require.resolve(packageName);
    console.log(`${packageName} is already installed.`);
  } catch (e) {
    console.log(`${packageName} is not installed. Installing...`);
    execSync(`npm install ${packageName}`, { stdio: 'inherit' });
  }
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = Object.keys(packageJson.dependencies);

dependencies.forEach(checkAndInstall);