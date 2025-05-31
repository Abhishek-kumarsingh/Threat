#!/usr/bin/env node

/**
 * Start All Services and Run Comprehensive Tests
 */

const { spawn } = require('child_process');
const axios = require('axios');
const fs = require('fs');

let processes = [];

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

function startService(name, command, cwd = '.') {
  return new Promise((resolve) => {
    log(`🚀 Starting ${name}...`, 'info');
    
    const process = spawn('cmd', ['/c', command], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });
    
    processes.push({ name, process });
    
    let output = '';
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    // Give service time to start
    setTimeout(() => {
      if (output.includes('error') || output.includes('Error')) {
        log(`❌ ${name} failed to start: ${output}`, 'error');
      } else {
        log(`✅ ${name} started`, 'success');
      }
      resolve();
    }, 5000);
  });
}

async function waitForService(url, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(url, { timeout: 2000 });
      return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
}

async function testAuthentication() {
  log('🔐 Testing Authentication...', 'info');
  
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
      
      if (response.data.token) {
        log(`✅ ${cred.role} login successful`, 'success');
        results.push({ role: cred.role, success: true, token: response.data.token });
      } else {
        log(`❌ ${cred.role} login failed: No token`, 'error');
        results.push({ role: cred.role, success: false });
      }
    } catch (error) {
      log(`❌ ${cred.role} login failed: ${error.message}`, 'error');
      results.push({ role: cred.role, success: false, error: error.message });
    }
  }
  
  return results;
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
  
  try {
    const response = await axios.post('http://localhost:5001/predict', testData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    log(`✅ Model prediction successful: ${JSON.stringify(response.data, null, 2)}`, 'success');
    return { success: true, data: response.data };
  } catch (error) {
    log(`❌ Model prediction failed: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

async function testDashboardEndpoints(token) {
  log('📊 Testing Dashboard Endpoints...', 'info');
  
  const endpoints = [
    { name: 'Sensors', url: 'http://localhost:5000/api/sensors' },
    { name: 'Threat Zones', url: 'http://localhost:5000/api/threat-zones' },
    { name: 'Alerts', url: 'http://localhost:5000/api/alerts' },
    { name: 'Locations', url: 'http://localhost:5000/api/locations' }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint.url, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 5000
      });
      
      log(`✅ ${endpoint.name} endpoint working`, 'success');
      results.push({ name: endpoint.name, success: true, count: response.data.data?.length || 0 });
    } catch (error) {
      log(`❌ ${endpoint.name} endpoint failed: ${error.message}`, 'error');
      results.push({ name: endpoint.name, success: false, error: error.message });
    }
  }
  
  return results;
}

function generateReport(authResults, modelResults, dashboardResults) {
  const report = {
    timestamp: new Date().toISOString(),
    authentication: authResults,
    model: modelResults,
    dashboard: dashboardResults,
    summary: {
      auth_success_rate: (authResults.filter(r => r.success).length / authResults.length * 100).toFixed(1),
      model_working: modelResults.success,
      dashboard_success_rate: (dashboardResults.filter(r => r.success).length / dashboardResults.length * 100).toFixed(1)
    }
  };
  
  fs.writeFileSync('full-stack-test-report.json', JSON.stringify(report, null, 2));
  
  console.log('\n' + '='.repeat(60));
  log('🎯 FULL-STACK TEST RESULTS', 'info');
  console.log('='.repeat(60));
  
  log(`🔐 Authentication: ${report.summary.auth_success_rate}% success rate`, 'info');
  log(`🧠 ML Model: ${report.summary.model_working ? 'Working' : 'Failed'}`, 'info');
  log(`📊 Dashboard: ${report.summary.dashboard_success_rate}% success rate`, 'info');
  
  const overallSuccess = report.summary.auth_success_rate >= 80 && 
                        report.summary.model_working && 
                        report.summary.dashboard_success_rate >= 80;
  
  log(`\n🎉 Overall Status: ${overallSuccess ? 'SUCCESS - All systems operational!' : 'PARTIAL - Some issues detected'}`, 
      overallSuccess ? 'success' : 'warning');
  
  console.log('\n📄 Detailed report saved to: full-stack-test-report.json');
}

function cleanup() {
  log('🧹 Cleaning up processes...', 'info');
  processes.forEach(({ name, process }) => {
    try {
      process.kill();
      log(`✅ Stopped ${name}`, 'success');
    } catch (error) {
      log(`❌ Failed to stop ${name}: ${error.message}`, 'error');
    }
  });
}

async function main() {
  log('🚀 Starting Full-Stack Integration Test Suite', 'info');
  
  try {
    // Start services
    await startService('Frontend', 'npm run dev');
    await startService('Backend', 'npm start', './backend');
    await startService('ML Model', 'python app.py', './model');
    
    // Wait for services to be ready
    log('⏳ Waiting for services to be ready...', 'info');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Check if services are responding
    const frontendReady = await waitForService('http://localhost:3000');
    const backendReady = await waitForService('http://localhost:5000/api/health');
    const modelReady = await waitForService('http://localhost:5001/health');
    
    log(`Frontend: ${frontendReady ? '✅' : '❌'}`, frontendReady ? 'success' : 'error');
    log(`Backend: ${backendReady ? '✅' : '❌'}`, backendReady ? 'success' : 'error');
    log(`ML Model: ${modelReady ? '✅' : '❌'}`, modelReady ? 'success' : 'error');
    
    if (!frontendReady || !backendReady) {
      log('❌ Core services not ready. Skipping tests.', 'error');
      return;
    }
    
    // Run tests
    const authResults = await testAuthentication();
    const modelResults = modelReady ? await testModelPredictions() : { success: false, error: 'Service not ready' };
    
    // Test dashboard with admin token
    const adminAuth = authResults.find(r => r.role === 'admin' && r.success);
    const dashboardResults = adminAuth ? await testDashboardEndpoints(adminAuth.token) : [];
    
    // Generate report
    generateReport(authResults, modelResults, dashboardResults);
    
  } catch (error) {
    log(`💥 Test suite failed: ${error.message}`, 'error');
  } finally {
    // Don't cleanup automatically - let user stop services manually
    log('\n📝 Services are still running. Stop them manually when done testing.', 'info');
  }
}

// Handle cleanup on exit
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

main().catch(console.error);
