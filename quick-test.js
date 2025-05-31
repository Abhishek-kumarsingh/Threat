#!/usr/bin/env node

/**
 * Quick Status Check for All Services
 */

const axios = require('axios');

const services = {
  frontend: 'http://localhost:3000',
  backend: 'http://localhost:5000',
  model: 'http://localhost:5001'
};

async function checkService(name, url) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    console.log(`✅ ${name}: ONLINE (${response.status})`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: OFFLINE (${error.message})`);
    return false;
  }
}

async function testLogin() {
  try {
    const response = await axios.post(`${services.frontend}/api/auth/login`, {
      email: 'admin@threatguard.com',
      password: 'admin123'
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    console.log(`✅ Login: SUCCESS (Token: ${response.data.token ? 'Generated' : 'Missing'})`);
    return response.data.token;
  } catch (error) {
    console.log(`❌ Login: FAILED (${error.message})`);
    return null;
  }
}

async function testModelPrediction() {
  try {
    const response = await axios.post(`${services.model}/predict`, {
      mq2_reading: 5.0,
      mq4_reading: 3.0,
      mq6_reading: 4.0,
      mq8_reading: 2.0,
      temperature: 25,
      humidity: 60
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    console.log(`✅ Model Prediction: SUCCESS (Threat Level: ${response.data.threat_level || 'Unknown'})`);
    return true;
  } catch (error) {
    console.log(`❌ Model Prediction: FAILED (${error.message})`);
    return false;
  }
}

async function runQuickTest() {
  console.log('🚀 Quick Full-Stack Status Check\n');
  
  // Check service availability
  console.log('📡 Service Status:');
  const frontendOnline = await checkService('Frontend', services.frontend);
  const backendOnline = await checkService('Backend', `${services.backend}/api/health`);
  const modelOnline = await checkService('ML Model', `${services.model}/health`);
  
  console.log('\n🔐 Authentication Test:');
  const token = await testLogin();
  
  console.log('\n🧠 Model Test:');
  const modelWorking = await testModelPrediction();
  
  console.log('\n📊 Summary:');
  console.log(`Frontend: ${frontendOnline ? '✅' : '❌'}`);
  console.log(`Backend: ${backendOnline ? '✅' : '❌'}`);
  console.log(`ML Model: ${modelOnline ? '✅' : '❌'}`);
  console.log(`Authentication: ${token ? '✅' : '❌'}`);
  console.log(`Model Predictions: ${modelWorking ? '✅' : '❌'}`);
  
  const allWorking = frontendOnline && backendOnline && modelOnline && token && modelWorking;
  console.log(`\n🎯 Overall Status: ${allWorking ? '✅ ALL SYSTEMS OPERATIONAL' : '⚠️  SOME ISSUES DETECTED'}`);
  
  if (allWorking) {
    console.log('\n🎉 Your application is fully synchronized and ready for testing!');
    console.log('📋 You can now:');
    console.log('   • Login at: http://localhost:3000/auth/login');
    console.log('   • Test ML models at: http://localhost:3000/ml-test');
    console.log('   • View dashboard at: http://localhost:3000/dashboard');
  } else {
    console.log('\n🔧 Next steps:');
    if (!frontendOnline) console.log('   • Start frontend: npm run dev');
    if (!backendOnline) console.log('   • Start backend: cd backend && npm start');
    if (!modelOnline) console.log('   • Start ML model: cd model && python app.py');
  }
}

runQuickTest().catch(console.error);
