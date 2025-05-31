#!/usr/bin/env node

/**
 * Comprehensive Full-Stack Test Suite
 * Tests Frontend + Backend + Model Integration
 */

const axios = require('axios');
const fs = require('fs');

// Configuration
const config = {
  frontend: 'http://localhost:3000',
  backend: 'http://localhost:5000',
  model: 'http://localhost:5001',
  testCredentials: {
    admin: { email: 'admin@threatguard.com', password: 'admin123' },
    operator: { email: 'operator@threatguard.com', password: 'operator123' },
    user: { email: 'user@threatguard.com', password: 'user123' }
  }
};

// Test Results Storage
let testResults = {
  frontend: { passed: 0, failed: 0, tests: [] },
  backend: { passed: 0, failed: 0, tests: [] },
  model: { passed: 0, failed: 0, tests: [] },
  integration: { passed: 0, failed: 0, tests: [] }
};

// Utility Functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

function recordTest(category, testName, passed, details = '') {
  testResults[category].tests.push({
    name: testName,
    passed,
    details,
    timestamp: new Date().toISOString()
  });
  
  if (passed) {
    testResults[category].passed++;
    log(`✅ ${testName}`, 'success');
  } else {
    testResults[category].failed++;
    log(`❌ ${testName}: ${details}`, 'error');
  }
}

async function makeRequest(url, options = {}) {
  try {
    const response = await axios({
      url,
      timeout: 10000,
      ...options
    });
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.message, 
      status: error.response?.status,
      data: error.response?.data 
    };
  }
}

// Test Suites
async function testFrontendHealth() {
  log('🔍 Testing Frontend Health...', 'info');
  
  // Test homepage accessibility
  const homeTest = await makeRequest(config.frontend);
  recordTest('frontend', 'Homepage Accessible', homeTest.success, homeTest.error);
  
  // Test login page
  const loginTest = await makeRequest(`${config.frontend}/auth/login`);
  recordTest('frontend', 'Login Page Accessible', loginTest.success, loginTest.error);
  
  // Test API routes
  const apiTest = await makeRequest(`${config.frontend}/api/health`);
  recordTest('frontend', 'API Routes Working', apiTest.success, apiTest.error);
}

async function testBackendHealth() {
  log('🔍 Testing Backend Health...', 'info');
  
  // Test backend health endpoint
  const healthTest = await makeRequest(`${config.backend}/api/health`);
  recordTest('backend', 'Health Endpoint', healthTest.success, healthTest.error);
  
  // Test database connection
  const dbTest = await makeRequest(`${config.backend}/api/status`);
  recordTest('backend', 'Database Connection', dbTest.success, dbTest.error);
}

async function testModelHealth() {
  log('🔍 Testing ML Model Health...', 'info');
  
  // Test model health
  const healthTest = await makeRequest(`${config.model}/health`);
  recordTest('model', 'Model Health Check', healthTest.success, healthTest.error);
  
  // Test model info
  const infoTest = await makeRequest(`${config.model}/info`);
  recordTest('model', 'Model Info Endpoint', infoTest.success, infoTest.error);
  
  if (infoTest.success) {
    log(`📊 Model Info: ${JSON.stringify(infoTest.data, null, 2)}`, 'info');
  }
}

async function testAuthentication() {
  log('🔐 Testing Authentication System...', 'info');
  
  for (const [role, credentials] of Object.entries(config.testCredentials)) {
    // Test login
    const loginTest = await makeRequest(`${config.frontend}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: credentials
    });
    
    recordTest('integration', `${role} Login`, loginTest.success, loginTest.error);
    
    if (loginTest.success && loginTest.data.token) {
      // Test authenticated request
      const authTest = await makeRequest(`${config.frontend}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${loginTest.data.token}` }
      });
      
      recordTest('integration', `${role} Authenticated Request`, authTest.success, authTest.error);
      
      log(`👤 ${role} user authenticated successfully`, 'success');
    }
  }
}

async function testModelPredictions() {
  log('🧠 Testing ML Model Predictions...', 'info');
  
  const testData = {
    mq2_reading: 5.0,
    mq4_reading: 3.0,
    mq6_reading: 4.0,
    mq8_reading: 2.0,
    temperature: 25,
    humidity: 60,
    location: [40.7128, -74.0060],
    wind_speed: 10,
    wind_direction: 180
  };
  
  // Test direct model prediction
  const modelTest = await makeRequest(`${config.model}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: testData
  });
  
  recordTest('model', 'Direct Model Prediction', modelTest.success, modelTest.error);
  
  if (modelTest.success) {
    log(`🎯 Prediction Result: ${JSON.stringify(modelTest.data, null, 2)}`, 'info');
  }
}

async function testBackendIntegration() {
  log('🔗 Testing Backend-Model Integration...', 'info');
  
  // First, login to get token
  const loginResult = await makeRequest(`${config.frontend}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: config.testCredentials.admin
  });
  
  if (!loginResult.success) {
    recordTest('integration', 'Backend Integration Setup', false, 'Failed to login');
    return;
  }
  
  const token = loginResult.data.token;
  const authHeaders = { 'Authorization': `Bearer ${token}` };
  
  // Test ML model health through backend
  const mlHealthTest = await makeRequest(`${config.backend}/api/ml/health`, {
    headers: authHeaders
  });
  
  recordTest('integration', 'Backend-Model Health Check', mlHealthTest.success, mlHealthTest.error);
}

async function testDashboardData() {
  log('📊 Testing Dashboard Data Flow...', 'info');
  
  // Login as admin
  const loginResult = await makeRequest(`${config.frontend}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: config.testCredentials.admin
  });
  
  if (!loginResult.success) {
    recordTest('integration', 'Dashboard Data Setup', false, 'Failed to login');
    return;
  }
  
  const token = loginResult.data.token;
  const authHeaders = { 'Authorization': `Bearer ${token}` };
  
  // Test dashboard endpoints
  const endpoints = [
    { name: 'Sensors Data', url: `${config.backend}/api/sensors` },
    { name: 'Threat Zones Data', url: `${config.backend}/api/threat-zones` },
    { name: 'Alerts Data', url: `${config.backend}/api/alerts` },
    { name: 'Locations Data', url: `${config.backend}/api/locations` }
  ];
  
  for (const endpoint of endpoints) {
    const test = await makeRequest(endpoint.url, { headers: authHeaders });
    recordTest('integration', endpoint.name, test.success, test.error);
  }
}

function generateTestReport() {
  log('📋 Generating Test Report...', 'info');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total_tests: 0,
      passed: 0,
      failed: 0,
      success_rate: 0
    },
    categories: testResults
  };
  
  // Calculate totals
  for (const category of Object.values(testResults)) {
    report.summary.total_tests += category.passed + category.failed;
    report.summary.passed += category.passed;
    report.summary.failed += category.failed;
  }
  
  report.summary.success_rate = report.summary.total_tests > 0 
    ? ((report.summary.passed / report.summary.total_tests) * 100).toFixed(2)
    : 0;
  
  // Save report
  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  
  // Display summary
  console.log('\n' + '='.repeat(60));
  log('🎯 FULL-STACK TEST SUMMARY', 'info');
  console.log('='.repeat(60));
  
  log(`📊 Total Tests: ${report.summary.total_tests}`, 'info');
  log(`✅ Passed: ${report.summary.passed}`, 'success');
  log(`❌ Failed: ${report.summary.failed}`, 'error');
  log(`📈 Success Rate: ${report.summary.success_rate}%`, 'info');
  
  console.log('\n📋 Category Breakdown:');
  for (const [category, results] of Object.entries(testResults)) {
    const total = results.passed + results.failed;
    const rate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
    log(`  ${category.toUpperCase()}: ${results.passed}/${total} (${rate}%)`, 
         results.failed === 0 ? 'success' : 'warning');
  }
  
  console.log('\n📄 Detailed report saved to: test-report.json');
  
  return report.summary.success_rate >= 80;
}

// Main Test Runner
async function runFullStackTests() {
  log('🚀 Starting Full-Stack Integration Tests...', 'info');
  log('Testing: Frontend + Backend + ML Model + Integration', 'info');
  
  try {
    // Health checks
    await testFrontendHealth();
    await testBackendHealth();
    await testModelHealth();
    
    // Authentication
    await testAuthentication();
    
    // Model functionality
    await testModelPredictions();
    
    // Integration tests
    await testBackendIntegration();
    await testDashboardData();
    
    // Generate report
    const success = generateTestReport();
    
    if (success) {
      log('🎉 All tests completed successfully!', 'success');
      process.exit(0);
    } else {
      log('⚠️  Some tests failed. Check the report for details.', 'warning');
      process.exit(1);
    }
    
  } catch (error) {
    log(`💥 Test suite failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runFullStackTests();
}

module.exports = { runFullStackTests, testResults };
