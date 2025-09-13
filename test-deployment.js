#!/usr/bin/env node

/**
 * Test script for deployment verification
 * Run with: node test-deployment.js [backend-url]
 */

import https from 'https';
import http from 'http';

const BACKEND_URL = process.argv[2] || 'http://localhost:5000';

console.log('🚀 Testing Save Cheetah Deployment');
console.log('=====================================');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log('');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testEndpoint(name, url, expectedStatus = 200) {
  console.log(`Testing ${name}...`);
  try {
    const result = await makeRequest(url);
    if (result.status === expectedStatus) {
      console.log(`✅ ${name}: ${result.status}`);
      if (result.data && typeof result.data === 'object') {
        console.log(`   Response: ${JSON.stringify(result.data, null, 2)}`);
      }
    } else {
      console.log(`❌ ${name}: ${result.status} (expected ${expectedStatus})`);
      if (result.data) {
        console.log(`   Response: ${result.data}`);
      }
    }
  } catch (error) {
    console.log(`❌ ${name}: Error - ${error.message}`);
  }
  console.log('');
}

async function runTests() {
  // Test health endpoint
  await testEndpoint('Health Check', `${BACKEND_URL}/health`);

  // Test ping endpoint
  await testEndpoint('Ping', `${BACKEND_URL}/api/ping`);

  // Test game start endpoint
  await testEndpoint('Game Start', `${BACKEND_URL}/api/game/start`, 200);

  // Test global stats endpoint
  await testEndpoint('Global Stats', `${BACKEND_URL}/api/stats/global`);

  console.log('🎯 Deployment test completed!');
  console.log('');
  console.log('Next steps:');
  console.log('1. If all tests passed, your backend is working correctly');
  console.log('2. Deploy frontend to Vercel with VITE_API_BASE_URL set to your backend URL');
  console.log('3. Test the full application end-to-end');
}

runTests().catch(console.error);