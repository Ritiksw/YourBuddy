// Quick user registration test
// Run this with: node test-register.js

const axios = require('axios');

const API_BASE = 'http://localhost:8080/api';

async function registerTestUser() {
  console.log('🔍 Testing User Registration\n');
  
  try {
    // Try to register the test user
    console.log('1. Attempting to register test user...');
    const registerPayload = {
      username: 'testuser',
      email: 'test@buddy.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };
    
    console.log('Registration payload:', registerPayload);
    
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Registration successful!');
    console.log('Response status:', registerResponse.status);
    console.log('Response data:', registerResponse.data);
    
    // Now try to login
    console.log('\n2. Testing login with registered user...');
    const loginPayload = {
      username: 'testuser',
      password: 'password123'
    };
    
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('Token received:', loginResponse.data.token ? 'YES' : 'NO');
    console.log('User info:', loginResponse.data.user?.username);
    
    console.log('\n🎉 User registration and login working!');
    
  } catch (error) {
    console.log('\n❌ Registration/Login failed:');
    console.log('Status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    console.log('Error message:', error.message);
    
    if (error.response?.status === 400) {
      console.log('\n🔍 Possible causes:');
      console.log('- User already exists (this is actually good!)');
      console.log('- Invalid registration data');
      console.log('- Try running the login test: node test-jwt-auth.js');
    }
  }
}

registerTestUser(); 