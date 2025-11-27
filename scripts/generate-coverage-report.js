#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📊 Generating Combined Coverage Report...\n');

// Read backend coverage
let backendCoverage = 'No backend coverage data found';
try {
  const backendCoverageFile = path.join(__dirname, '../backend/coverage.xml');
  if (fs.existsSync(backendCoverageFile)) {
    const coverage = fs.readFileSync(backendCoverageFile, 'utf8');
    const match = coverage.match(/line-rate="([^"]+)"/);
    if (match) {
      const percentage = Math.round(parseFloat(match[1]) * 100);
      backendCoverage = `${percentage}%`;
    }
  }
} catch (error) {
  console.warn('⚠️  Could not read backend coverage:', error.message);
}

// Read frontend coverage
let frontendCoverage = 'No frontend coverage data found';
try {
  const frontendCoverageFile = path.join(__dirname, '../frontend/coverage/lcov-report/index.html');
  if (fs.existsSync(frontendCoverageFile)) {
    const coverage = fs.readFileSync(frontendCoverageFile, 'utf8');
    const match = coverage.match(/(\d+\.?\d*)%<\/span> Lines/);
    if (match) {
      frontendCoverage = `${match[1]}%`;
    }
  }
} catch (error) {
  console.warn('⚠️  Could not read frontend coverage:', error.message);
}

// Generate report
const report = `
# 📊 EduMindSolutions Coverage Report

Generated: ${new Date().toISOString()}

## Backend Coverage
- **Lines Covered**: ${backendCoverage}
- **Report Location**: \`backend/htmlcov/index.html\`

## Frontend Coverage  
- **Lines Covered**: ${frontendCoverage}
- **Report Location**: \`frontend/coverage/lcov-report/index.html\`

## Coverage Thresholds
- ✅ **Target**: 80% minimum
- 🎯 **Goal**: 90% optimal

## View Detailed Reports
\`\`\`bash
# Backend HTML Report
open backend/htmlcov/index.html

# Frontend HTML Report  
open frontend/coverage/lcov-report/index.html
\`\`\`
`;

fs.writeFileSync('COVERAGE-REPORT.md', report);
console.log('✅ Coverage report generated: COVERAGE-REPORT.md');
console.log(`📈 Backend: ${backendCoverage} | Frontend: ${frontendCoverage}`);