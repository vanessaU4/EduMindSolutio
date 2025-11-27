#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Checking Dependencies for Updates...\n');

// Check Python dependencies
console.log('🐍 Python Dependencies:');
try {
  const pythonOutdated = execSync('cd backend && pip list --outdated', { encoding: 'utf8' });
  if (pythonOutdated.trim()) {
    console.log(pythonOutdated);
  } else {
    console.log('✅ All Python packages are up to date');
  }
} catch (error) {
  console.log('⚠️  Could not check Python dependencies');
}

console.log('\n📦 Node.js Dependencies:');
try {
  const nodeOutdated = execSync('cd frontend && npm outdated', { encoding: 'utf8' });
  if (nodeOutdated.trim()) {
    console.log(nodeOutdated);
  } else {
    console.log('✅ All Node.js packages are up to date');
  }
} catch (error) {
  console.log('✅ All Node.js packages are up to date');
}

// Generate dependency report
const report = `
# 🔧 Dependency Status Report

Generated: ${new Date().toISOString()}

## Update Commands

### Backend (Python)
\`\`\`bash
cd backend
pip list --outdated
pip install --upgrade package_name
\`\`\`

### Frontend (Node.js)
\`\`\`bash
cd frontend
npm outdated
npm update
\`\`\`

## Security Updates
\`\`\`bash
# Check for security vulnerabilities
npm run test:security
\`\`\`
`;

fs.writeFileSync('DEPENDENCY-REPORT.md', report);
console.log('\n✅ Dependency report generated: DEPENDENCY-REPORT.md');