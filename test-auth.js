// Quick authentication test script
// Run this with: node test-auth.js

const axios = require('axios');

const API_BASE = 'http://localhost:8080/api';

async function testAuth() {
  try {
    console.log('🔍 Testing Authentication...\n');
    
    // Step 1: Test login
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'testuser',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', loginResponse.data.token ? 'Present' : 'Missing');
    console.log('User:', loginResponse.data.user?.username || 'Not found');
    
    const token = loginResponse.data.token;
    if (!token) {
      console.log('❌ No token received!');
      return;
    }
    
    // Step 2: Test authenticated request
    console.log('\n2. Testing authenticated goal creation...');
    const goalResponse = await axios.post(`${API_BASE}/goals`, {
      title: 'Test Goal from Script',
      category: 'FITNESS',
      startDate: '2024-01-15',
      targetDate: '2024-02-15',
      description: 'Test goal for authentication'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Goal creation successful!');
    console.log('Goal ID:', goalResponse.data.goalId || goalResponse.data.id);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔍 Authentication Details:');
      console.log('- Status: 401 Unauthorized');
      console.log('- This means the token is invalid or expired');
      console.log('- Check if backend is running: docker compose ps');
      console.log('- Check backend logs: docker compose logs backend --tail=10');
    }
  }
}

testAuth(); 