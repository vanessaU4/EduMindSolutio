# EduMindSolutions - Mental Health Platform

![CI/CD Pipeline](https://github.com/your-username/eduMindSolutions/workflows/CI/CD%20Pipeline/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-80%25-green)
![Security](https://img.shields.io/badge/security-passing-brightgreen)
![Maintenance](https://img.shields.io/badge/maintenance-active-brightgreen)

## 🚀 Automated CI/CD Features

When you push to GitHub, the following automated processes will run:

### 🧪 Testing & Coverage
- **Backend Tests**: Django unit tests with pytest
- **Frontend Tests**: React component tests with Jest
- **Coverage Reports**: Automatic coverage calculation and reporting
- **Coverage Badges**: Dynamic coverage percentage badges
- **Codecov Integration**: Detailed coverage analysis and trends

### 🔒 Security & Quality
- **Security Scanning**: Trivy vulnerability scanner
- **Dependency Audit**: Python (safety) and Node.js (npm audit) security checks
- **Code Quality**: SonarCloud static analysis
- **SAST Scanning**: Static Application Security Testing

### 🔧 Maintenance & Monitoring
- **Dependency Updates**: Daily checks for outdated packages
- **Performance Monitoring**: Automated performance tests
- **Code Metrics**: Complexity analysis and maintainability reports
- **Security Audits**: Regular security vulnerability assessments

### 📊 Reports Generated
- **Test Results**: Detailed test execution reports
- **Coverage Reports**: HTML and XML coverage reports
- **Security Reports**: Vulnerability and security issue reports
- **Code Quality Reports**: Maintainability and complexity metrics
- **Performance Reports**: Execution time and resource usage

## 🛠️ Setup for GitHub Actions

1. **Enable GitHub Actions** in your repository settings
2. **Add Secrets** to your repository:
   ```
   SONAR_TOKEN=your_sonarcloud_token
   CODECOV_TOKEN=your_codecov_token (optional)
   ```
3. **Configure SonarCloud**:
   - Update `sonar-project.properties` with your organization
   - Set up SonarCloud project integration

## 📈 Coverage Thresholds

- **Backend**: 80% minimum coverage
- **Frontend**: 80% minimum coverage
- **Overall**: 80% combined coverage target

## 🔄 Workflow Triggers

### CI/CD Pipeline (`ci.yml`)
- Triggers on: Push to `main`/`develop`, Pull Requests
- Runs: Tests, Coverage, Security Scans, Quality Checks

### Coverage Report (`coverage.yml`)
- Triggers on: Push to `main`/`develop`, Pull Requests
- Runs: Detailed coverage analysis and reporting

### Maintenance (`maintenance.yml`)
- Triggers on: Daily schedule (2 AM UTC), Manual dispatch
- Runs: Dependency updates, Security audits, Performance monitoring

## 📋 Quality Gates

The CI/CD pipeline enforces the following quality gates:
- ✅ All tests must pass
- ✅ Coverage must be above 80%
- ✅ No high-severity security vulnerabilities
- ✅ Code quality score above threshold
- ✅ No critical linting errors

## 🚨 Automated Issue Creation

The system automatically creates GitHub issues for:
- 🔄 **Dependency Updates**: When outdated packages are detected
- 🔒 **Security Alerts**: When vulnerabilities are found
- 📊 **Code Quality Issues**: When metrics fall below thresholds
- 🐛 **Failed Builds**: When CI/CD pipeline fails

## 📊 Monitoring Dashboard

Access your project health through:
- **GitHub Actions**: Build status and logs
- **Codecov**: Coverage trends and analysis
- **SonarCloud**: Code quality metrics
- **GitHub Security**: Vulnerability alerts

## 🔧 Local Development Testing

Run the same checks locally:

```bash
# Backend tests with coverage
cd backend
python -m pytest --cov=. --cov-report=html

# Frontend tests with coverage
cd frontend
npm run test:coverage

# Security checks
cd backend
safety check -r requirements.txt
cd ../frontend
npm audit

# Code quality
cd backend
flake8 .
radon cc .
```

## 📝 Contributing

All contributions are automatically tested and validated through our CI/CD pipeline. Please ensure:
1. Tests pass locally before pushing
2. Coverage remains above 80%
3. No security vulnerabilities introduced
4. Code follows style guidelines

The automated system will provide feedback on your pull requests with detailed reports on test results, coverage changes, and code quality metrics.