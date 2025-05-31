const http = require('http');

console.log('🧪 Testing Backend Connection...');

// Test backend health
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/sensors',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`✅ Backend Status: ${res.statusCode}`);
  console.log(`📡 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('📊 Response Data:');
      console.log(JSON.stringify(jsonData, null, 2));
      console.log('\n🎉 Backend is responding correctly!');
    } catch (error) {
      console.log('📊 Raw Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Connection Error:', error.message);
});

req.setTimeout(5000, () => {
  console.error('❌ Request Timeout');
  req.destroy();
});

req.end();
