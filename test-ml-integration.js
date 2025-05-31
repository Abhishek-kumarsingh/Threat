#!/usr/bin/env node

/**
 * ML Integration Test Script
 * Tests the complete integration between frontend, backend, and ML model
 */

const axios = require('axios');
const { spawn } = require('child_process');

console.log('🧪 ML Integration Test Suite\n');

// Configuration
const config = {
    mlModel: 'http://localhost:5001',
    backend: 'http://localhost:5000',
    frontend: 'http://localhost:3000'
};

// Test data
const testSensorData = {
    mq2_reading: 8,
    mq4_reading: 6,
    mq6_reading: 7,
    mq8_reading: 5,
    temperature: 30,
    humidity: 65,
    location: [40.7128, -74.0060], // NYC coordinates
    wind_speed: 12,
    wind_direction: 180
};

// Utility functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testEndpoint(url, method = 'GET', data = null) {
    try {
        const config = {
            method,
            url,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        return {
            success: true,
            status: response.status,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            status: error.response?.status || 'No response'
        };
    }
}

// Test functions
async function testMLModelHealth() {
    console.log('🔍 Testing ML Model Health...');
    const result = await testEndpoint(`${config.mlModel}/health`);
    
    if (result.success && result.data.status === 'ok') {
        console.log('✅ ML Model is healthy');
        return true;
    } else {
        console.log('❌ ML Model health check failed:', result.error || result.status);
        return false;
    }
}

async function testMLModelInfo() {
    console.log('🔍 Testing ML Model Info...');
    const result = await testEndpoint(`${config.mlModel}/info`);
    
    if (result.success && result.data.version) {
        console.log(`✅ ML Model Info: v${result.data.version}, Status: ${result.data.status}`);
        console.log(`   Capabilities: ${result.data.capabilities.join(', ')}`);
        return true;
    } else {
        console.log('❌ ML Model info failed:', result.error || result.status);
        return false;
    }
}

async function testMLModelPrediction() {
    console.log('🔍 Testing ML Model Prediction...');
    const result = await testEndpoint(`${config.mlModel}/predict`, 'POST', testSensorData);
    
    if (result.success && result.data.threat_level) {
        console.log(`✅ ML Prediction successful:`);
        console.log(`   Threat Level: ${result.data.threat_level.toUpperCase()}`);
        console.log(`   Risk Score: ${result.data.prediction_value}/10`);
        console.log(`   Confidence: ${(result.data.confidence * 100).toFixed(1)}%`);
        console.log(`   Fallback Mode: ${result.data.is_fallback ? 'Yes' : 'No'}`);
        return true;
    } else {
        console.log('❌ ML Prediction failed:', result.error || result.status);
        return false;
    }
}

async function testBackendMLHealth() {
    console.log('🔍 Testing Backend ML Health Check...');
    const result = await testEndpoint(`${config.backend}/api/ml/health`);
    
    if (result.success && result.data.success) {
        console.log(`✅ Backend ML Health: ${result.data.data.status}`);
        console.log(`   Model Ready: ${result.data.data.modelReady}`);
        return true;
    } else {
        console.log('❌ Backend ML health check failed:', result.error || result.status);
        return false;
    }
}

async function testBackendMLInfo() {
    console.log('🔍 Testing Backend ML Info...');
    const result = await testEndpoint(`${config.backend}/api/ml/info`);
    
    if (result.success && result.data.success) {
        console.log(`✅ Backend ML Info: v${result.data.data.version}`);
        return true;
    } else {
        console.log('❌ Backend ML info failed:', result.error || result.status);
        return false;
    }
}

async function testBackendMLPrediction() {
    console.log('🔍 Testing Backend ML Prediction...');
    const result = await testEndpoint(`${config.backend}/api/ml/test-prediction`, 'POST', testSensorData);
    
    if (result.success && result.data.success) {
        const prediction = result.data.data.prediction;
        console.log(`✅ Backend ML Prediction successful:`);
        console.log(`   Threat Level: ${prediction.threat_level.toUpperCase()}`);
        console.log(`   Risk Score: ${prediction.prediction_value}/10`);
        return true;
    } else {
        console.log('❌ Backend ML prediction failed:', result.error || result.status);
        return false;
    }
}

async function testFrontendAccess() {
    console.log('🔍 Testing Frontend Access...');
    const result = await testEndpoint(`${config.frontend}`);
    
    if (result.success) {
        console.log('✅ Frontend is accessible');
        return true;
    } else {
        console.log('❌ Frontend access failed:', result.error || result.status);
        return false;
    }
}

async function testMLTestPage() {
    console.log('🔍 Testing ML Test Page...');
    const result = await testEndpoint(`${config.frontend}/ml-test`);
    
    if (result.success) {
        console.log('✅ ML Test Page is accessible');
        return true;
    } else {
        console.log('❌ ML Test Page access failed:', result.error || result.status);
        return false;
    }
}

// Main test runner
async function runTests() {
    console.log('Starting ML Integration Tests...\n');
    
    const tests = [
        { name: 'ML Model Health', fn: testMLModelHealth },
        { name: 'ML Model Info', fn: testMLModelInfo },
        { name: 'ML Model Prediction', fn: testMLModelPrediction },
        { name: 'Backend ML Health', fn: testBackendMLHealth },
        { name: 'Backend ML Info', fn: testBackendMLInfo },
        { name: 'Backend ML Prediction', fn: testBackendMLPrediction },
        { name: 'Frontend Access', fn: testFrontendAccess },
        { name: 'ML Test Page', fn: testMLTestPage }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name} threw an error:`, error.message);
            failed++;
        }
        console.log(''); // Add spacing between tests
    }
    
    // Summary
    console.log('📊 Test Results Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed! ML integration is working perfectly!');
        console.log('\n🔗 Quick Links:');
        console.log(`   ML Test Interface: ${config.frontend}/ml-test`);
        console.log(`   Dashboard: ${config.frontend}/dashboard`);
        console.log(`   ML Model API: ${config.mlModel}/health`);
        console.log(`   Backend API: ${config.backend}/api`);
    } else {
        console.log('\n⚠️  Some tests failed. Please check the services and try again.');
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Make sure all services are running');
        console.log('   2. Check port configurations');
        console.log('   3. Verify Python dependencies are installed');
        console.log('   4. Check MongoDB is running');
    }
    
    return failed === 0;
}

// Check if services are running
async function checkServices() {
    console.log('🔍 Checking if services are running...\n');
    
    const services = [
        { name: 'ML Model', url: `${config.mlModel}/health` },
        { name: 'Backend API', url: `${config.backend}/api` },
        { name: 'Frontend', url: config.frontend }
    ];
    
    let allRunning = true;
    
    for (const service of services) {
        const result = await testEndpoint(service.url);
        if (result.success) {
            console.log(`✅ ${service.name} is running`);
        } else {
            console.log(`❌ ${service.name} is not running`);
            allRunning = false;
        }
    }
    
    if (!allRunning) {
        console.log('\n⚠️  Not all services are running. Please start them first:');
        console.log('   npm run dev:with-ml');
        console.log('\n   Or start manually:');
        console.log('   1. cd model && python app.py');
        console.log('   2. cd backend && npm run dev');
        console.log('   3. npm run dev');
        process.exit(1);
    }
    
    console.log('\n✅ All services are running. Starting tests...\n');
}

// Main execution
async function main() {
    try {
        await checkServices();
        await sleep(2000); // Give services a moment
        const success = await runTests();
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
        process.exit(1);
    }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('ML Integration Test Suite');
    console.log('');
    console.log('Usage: node test-ml-integration.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h    Show this help message');
    console.log('');
    console.log('Make sure all services are running before running tests:');
    console.log('  npm run dev:with-ml');
    process.exit(0);
}

// Run the tests
main();
