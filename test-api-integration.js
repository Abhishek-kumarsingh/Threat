const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
};

// Test endpoints
const endpoints = [
    { name: 'Health Check', url: `${API_BASE}/test`, method: 'GET' },
    { name: 'Sensors List', url: `${API_BASE}/sensors`, method: 'GET' },
    { name: 'Alerts List', url: `${API_BASE}/alerts`, method: 'GET' },
    { name: 'Dashboard Data', url: `${API_BASE}/dashboard`, method: 'GET' },
    { name: 'User Profile', url: `${API_BASE}/auth/me`, method: 'GET' },
    { name: 'Threat Zones', url: `${API_BASE}/threat-zones`, method: 'GET' },
    { name: 'Admin Dashboard', url: `${API_BASE}/admin/dashboard`, method: 'GET' },
    { name: 'Notifications', url: `${API_BASE}/notifications`, method: 'GET' }
];

// Test function
async function testEndpoint(endpoint) {
    try {
        console.log(`\n🧪 Testing: ${endpoint.name}`);
        console.log(`📡 ${endpoint.method} ${endpoint.url}`);
        
        const response = await axios({
            method: endpoint.method,
            url: endpoint.url,
            ...testConfig
        });
        
        console.log(`✅ Status: ${response.status}`);
        console.log(`📊 Response: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`);
        
        return { success: true, status: response.status, data: response.data };
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.response) {
            console.log(`📊 Status: ${error.response.status}`);
            console.log(`📊 Response: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        return { success: false, error: error.message };
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting API Integration Tests...\n');
    console.log('=' * 50);
    
    const results = [];
    
    for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint);
        results.push({ endpoint: endpoint.name, ...result });
        
        // Wait a bit between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    console.log('\n' + '=' * 50);
    console.log('📋 TEST SUMMARY');
    console.log('=' * 50);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${results.length}`);
    
    if (failed > 0) {
        console.log('\n❌ Failed Tests:');
        results.filter(r => !r.success).forEach(r => {
            console.log(`  - ${r.endpoint}: ${r.error}`);
        });
    }
    
    console.log('\n🎉 API Integration Testing Complete!');
    
    return results;
}

// Test authentication flow
async function testAuthFlow() {
    console.log('\n🔐 Testing Authentication Flow...');
    
    try {
        // Test registration
        const registerData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'Password123',
            role: 'user'
        };
        
        console.log('📝 Testing Registration...');
        const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData, testConfig);
        console.log(`✅ Registration: ${registerResponse.status}`);
        
        // Test login
        const loginData = {
            email: 'test@example.com',
            password: 'Password123'
        };
        
        console.log('🔑 Testing Login...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginData, testConfig);
        console.log(`✅ Login: ${loginResponse.status}`);
        
        if (loginResponse.data.token) {
            console.log('🎫 Token received successfully');
            
            // Test authenticated request
            const authConfig = {
                ...testConfig,
                headers: {
                    ...testConfig.headers,
                    'Authorization': `Bearer ${loginResponse.data.token}`
                }
            };
            
            console.log('👤 Testing Authenticated Request...');
            const profileResponse = await axios.get(`${API_BASE}/auth/me`, authConfig);
            console.log(`✅ Profile: ${profileResponse.status}`);
            console.log(`👤 User: ${profileResponse.data.data.name}`);
        }
        
    } catch (error) {
        console.log(`❌ Auth Error: ${error.message}`);
        if (error.response) {
            console.log(`📊 Status: ${error.response.status}`);
            console.log(`📊 Response: ${JSON.stringify(error.response.data, null, 2)}`);
        }
    }
}

// Main execution
(async () => {
    try {
        await runAllTests();
        await testAuthFlow();
    } catch (error) {
        console.error('💥 Test execution failed:', error);
    }
})();
