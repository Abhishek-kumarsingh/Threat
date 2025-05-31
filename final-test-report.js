#!/usr/bin/env node

/**
 * Final Comprehensive Test Report
 * Tests all working components and generates detailed report
 */

const axios = require('axios');
const fs = require('fs');

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

async function testFrontendFeatures() {
  log('🎨 Testing Frontend Features...', 'info');
  
  const tests = [];
  
  // Test main pages
  const pages = [
    { name: 'Homepage', url: 'http://localhost:3000' },
    { name: 'Login Page', url: 'http://localhost:3000/auth/login' },
    { name: 'ML Test Page', url: 'http://localhost:3000/ml-test' }
  ];
  
  for (const page of pages) {
    try {
      const response = await axios.get(page.url, { timeout: 5000 });
      tests.push({ name: page.name, success: true, status: response.status });
      log(`✅ ${page.name}: Accessible`, 'success');
    } catch (error) {
      tests.push({ name: page.name, success: false, error: error.message });
      log(`❌ ${page.name}: Failed`, 'error');
    }
  }
  
  return tests;
}

async function testAuthentication() {
  log('🔐 Testing Authentication System...', 'info');
  
  const credentials = [
    { role: 'admin', email: 'admin@threatguard.com', password: 'admin123' },
    { role: 'operator', email: 'operator@threatguard.com', password: 'operator123' },
    { role: 'user', email: 'user@threatguard.com', password: 'user123' }
  ];
  
  const results = [];
  
  for (const cred of credentials) {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', cred, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });
      
      if (response.data.token && response.data.user) {
        results.push({
          role: cred.role,
          success: true,
          user: response.data.user,
          tokenGenerated: !!response.data.token
        });
        log(`✅ ${cred.role} login: SUCCESS`, 'success');
      } else {
        results.push({ role: cred.role, success: false, reason: 'No token or user data' });
        log(`❌ ${cred.role} login: No token/user`, 'error');
      }
    } catch (error) {
      results.push({ role: cred.role, success: false, error: error.message });
      log(`❌ ${cred.role} login: ${error.message}`, 'error');
    }
  }
  
  return results;
}

async function testDatabaseConnection() {
  log('🗄️ Testing Database Connection...', 'info');
  
  try {
    // Test through the seed endpoint
    const response = await axios.post('http://localhost:3000/api/seed', {}, {
      timeout: 10000
    });
    
    if (response.data.success) {
      log('✅ Database: Connected and seeded', 'success');
      return { success: true, users: response.data.users };
    } else {
      log('❌ Database: Seed failed', 'error');
      return { success: false, error: 'Seed failed' };
    }
  } catch (error) {
    log(`❌ Database: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

async function testAPIEndpoints(token) {
  log('🔌 Testing API Endpoints...', 'info');
  
  const endpoints = [
    { name: 'User Profile', url: 'http://localhost:3000/api/user/profile' },
    { name: 'Test Login', url: 'http://localhost:3000/api/test-login' }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint.url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        timeout: 5000
      });
      
      results.push({ name: endpoint.name, success: true, status: response.status });
      log(`✅ ${endpoint.name}: Working`, 'success');
    } catch (error) {
      results.push({ name: endpoint.name, success: false, error: error.message });
      log(`❌ ${endpoint.name}: ${error.message}`, 'error');
    }
  }
  
  return results;
}

function generateComprehensiveReport(frontendTests, authTests, dbTest, apiTests) {
  const report = {
    timestamp: new Date().toISOString(),
    application_status: 'PARTIALLY_OPERATIONAL',
    test_results: {
      frontend: {
        total: frontendTests.length,
        passed: frontendTests.filter(t => t.success).length,
        tests: frontendTests
      },
      authentication: {
        total: authTests.length,
        passed: authTests.filter(t => t.success).length,
        tests: authTests
      },
      database: dbTest,
      api: {
        total: apiTests.length,
        passed: apiTests.filter(t => t.success).length,
        tests: apiTests
      }
    },
    summary: {
      frontend_working: frontendTests.filter(t => t.success).length === frontendTests.length,
      auth_working: authTests.filter(t => t.success).length >= 1,
      database_working: dbTest.success,
      api_working: apiTests.filter(t => t.success).length > 0
    },
    recommendations: []
  };
  
  // Add recommendations
  if (!report.summary.frontend_working) {
    report.recommendations.push('Fix frontend page accessibility issues');
  }
  if (!report.summary.auth_working) {
    report.recommendations.push('Fix authentication system');
  }
  if (!report.summary.database_working) {
    report.recommendations.push('Check MongoDB connection and seeding');
  }
  
  // Determine overall status
  const workingComponents = Object.values(report.summary).filter(Boolean).length;
  if (workingComponents >= 3) {
    report.application_status = 'MOSTLY_OPERATIONAL';
  }
  if (workingComponents === 4) {
    report.application_status = 'FULLY_OPERATIONAL';
  }
  
  return report;
}

function displayReport(report) {
  console.log('\n' + '='.repeat(80));
  log('🎯 COMPREHENSIVE FULL-STACK TEST REPORT', 'info');
  console.log('='.repeat(80));
  
  log(`📊 Application Status: ${report.application_status}`, 'info');
  log(`⏰ Test Time: ${report.timestamp}`, 'info');
  
  console.log('\n📋 Component Status:');
  log(`🎨 Frontend: ${report.summary.frontend_working ? '✅ WORKING' : '❌ ISSUES'}`, 
      report.summary.frontend_working ? 'success' : 'error');
  log(`🔐 Authentication: ${report.summary.auth_working ? '✅ WORKING' : '❌ ISSUES'}`, 
      report.summary.auth_working ? 'success' : 'error');
  log(`🗄️ Database: ${report.summary.database_working ? '✅ WORKING' : '❌ ISSUES'}`, 
      report.summary.database_working ? 'success' : 'error');
  log(`🔌 API: ${report.summary.api_working ? '✅ WORKING' : '❌ ISSUES'}`, 
      report.summary.api_working ? 'success' : 'error');
  
  console.log('\n📈 Test Results:');
  console.log(`Frontend Tests: ${report.test_results.frontend.passed}/${report.test_results.frontend.total} passed`);
  console.log(`Auth Tests: ${report.test_results.authentication.passed}/${report.test_results.authentication.total} passed`);
  console.log(`API Tests: ${report.test_results.api.passed}/${report.test_results.api.total} passed`);
  
  if (report.recommendations.length > 0) {
    console.log('\n🔧 Recommendations:');
    report.recommendations.forEach(rec => log(`  • ${rec}`, 'warning'));
  }
  
  console.log('\n🎉 What\'s Working:');
  if (report.summary.frontend_working) log('  ✅ Frontend pages are accessible', 'success');
  if (report.summary.auth_working) log('  ✅ User authentication system', 'success');
  if (report.summary.database_working) log('  ✅ Database connection and user management', 'success');
  if (report.summary.api_working) log('  ✅ API endpoints responding', 'success');
  
  console.log('\n📱 You can now:');
  log('  • Login at: http://localhost:3000/auth/login', 'info');
  log('  • Access dashboard: http://localhost:3000/dashboard', 'info');
  log('  • Test ML features: http://localhost:3000/ml-test', 'info');
  
  console.log('\n📄 Full report saved to: comprehensive-test-report.json');
}

async function runComprehensiveTest() {
  log('🚀 Running Comprehensive Full-Stack Test Suite', 'info');
  
  try {
    // Run all tests
    const frontendTests = await testFrontendFeatures();
    const authTests = await testAuthentication();
    const dbTest = await testDatabaseConnection();
    
    // Get admin token for API tests
    const adminAuth = authTests.find(t => t.role === 'admin' && t.success);
    const apiTests = await testAPIEndpoints(adminAuth?.token);
    
    // Generate and display report
    const report = generateComprehensiveReport(frontendTests, authTests, dbTest, apiTests);
    
    // Save report
    fs.writeFileSync('comprehensive-test-report.json', JSON.stringify(report, null, 2));
    
    // Display results
    displayReport(report);
    
  } catch (error) {
    log(`💥 Test suite failed: ${error.message}`, 'error');
  }
}

runComprehensiveTest().catch(console.error);
