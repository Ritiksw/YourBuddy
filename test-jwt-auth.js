// Comprehensive JWT Authentication Test
// Run this with: node test-jwt-auth.js

const axios = require('axios');

const API_BASE = 'http://localhost:8080/api';

async function testCompleteAuthFlow() {
  console.log('🔍 Comprehensive JWT Authentication Test\n');
  
  try {
    // Step 1: Test backend health
    console.log('1. Testing backend health...');
    try {
      const healthResponse = await axios.get(`${API_BASE}/actuator/health`);
      console.log('✅ Backend is healthy:', healthResponse.status);
    } catch (error) {
      console.log('❌ Backend health check failed:', error.message);
      return;
    }
    
    // Step 2: Test login endpoint
    console.log('\n2. Testing login...');
    const loginPayload = {
      username: 'testuser',
      password: 'password123'
    };
    
    console.log('Login payload:', loginPayload);
    
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('Response status:', loginResponse.status);
    console.log('Response data keys:', Object.keys(loginResponse.data));
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    if (!token) {
      console.log('❌ No JWT token received!');
      console.log('Full response:', JSON.stringify(loginResponse.data, null, 2));
      return;
    }
    
    console.log('Token received:', token ? 'YES' : 'NO');
    console.log('Token length:', token.length);
    console.log('Token starts with:', token.substring(0, 20) + '...');
    console.log('User info:', user ? `${user.username} (${user.email})` : 'Not found');
    
    // Step 3: Test JWT token structure
    console.log('\n3. Testing JWT token structure...');
    const tokenParts = token.split('.');
    console.log('JWT parts count:', tokenParts.length, '(should be 3)');
    
    if (tokenParts.length === 3) {
      try {
        const header = JSON.parse(atob(tokenParts[0]));
        const payload = JSON.parse(atob(tokenParts[1]));
        
        console.log('JWT Header:', header);
        console.log('JWT Payload:', payload);
        console.log('Token expires at:', new Date(payload.exp * 1000));
        console.log('Token is expired:', Date.now() > payload.exp * 1000);
      } catch (e) {
        console.log('❌ Failed to decode JWT:', e.message);
      }
    }
    
    // Step 4: Test authenticated request (goal creation)
    console.log('\n4. Testing authenticated goal creation...');
    
    const goalPayload = {
      title: 'Test Goal from Auth Script',
      category: 'FITNESS',
      startDate: '2024-01-15',
      targetDate: '2024-02-15',
      description: 'Test goal for authentication verification',
      difficulty: 'MEDIUM',
      isPublic: true,
      maxBuddies: 3
    };
    
    console.log('Goal payload:', goalPayload);
    console.log('Authorization header:', `Bearer ${token.substring(0, 20)}...`);
    
    const goalResponse = await axios.post(`${API_BASE}/goals`, goalPayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Goal creation successful!');
    console.log('Response status:', goalResponse.status);
    console.log('Goal ID:', goalResponse.data.goalId || goalResponse.data.id);
    console.log('Goal title:', goalResponse.data.title);
    
    // Step 5: Test getting goals
    console.log('\n5. Testing get goals...');
    const getGoalsResponse = await axios.get(`${API_BASE}/goals`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Get goals successful!');
    console.log('Total goals:', getGoalsResponse.data.totalGoals || getGoalsResponse.data.goals?.length || 0);
    
    console.log('\n🎉 All authentication tests passed!');
    
  } catch (error) {
    console.log('\n❌ Authentication test failed:');
    console.log('Status:', error.response?.status);
    console.log('Status text:', error.response?.statusText);
    console.log('Error data:', error.response?.data);
    console.log('Error message:', error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔍 Authentication Analysis:');
      console.log('- 401 Unauthorized means JWT token validation failed');
      console.log('- Possible causes:');
      console.log('  1. JWT_SECRET mismatch between login and validation');
      console.log('  2. Token format is incorrect');
      console.log('  3. Token is expired');
      console.log('  4. Authorization header format is wrong');
      console.log('  5. Spring Security configuration issue');
    }
    
    if (error.response?.status === 400) {
      console.log('\n🔍 Bad Request Analysis:');
      console.log('- 400 means the request data is invalid');
      console.log('- Check goal payload format and required fields');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔍 Connection Analysis:');
      console.log('- Backend is not running or not accessible');
      console.log('- Run: docker compose ps');
      console.log('- Check: docker compose logs backend');
    }
  }
}

// Helper function to decode base64
function atob(str) {
  return Buffer.from(str, 'base64').toString('binary');
}

testCompleteAuthFlow(); 