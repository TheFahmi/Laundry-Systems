const axios = require('axios');
require('dotenv').config();

// Test credentials
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  role: 'user'
};

// Base URL for the API
const API_URL = 'http://localhost:3001';

async function testAuthEndpoints() {
  console.log('Testing auth endpoints...');

  try {
    // Test register endpoint
    console.log('\n1. Testing register endpoint:');
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
      console.log('Register successful!');
      console.log('Response:', registerResponse.data);
    } catch (error) {
      console.log('Register failed:');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Response data:', error.response.data);
      } else {
        console.log('Error:', error.message);
      }
    }

    // Test login endpoint with correct credentials
    console.log('\n2. Testing login endpoint with correct credentials:');
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        username: testUser.username,
        password: testUser.password
      });
      console.log('Login successful!');
      console.log('Response:', loginResponse.data);
      
      // Save the token for later tests
      const token = loginResponse.data.token;
      
      // Test validate token endpoint
      if (token) {
        console.log('\n3. Testing validate token endpoint:');
        try {
          const validateResponse = await axios.post(`${API_URL}/auth/validate`, { token });
          console.log('Token validation successful!');
          console.log('Response:', validateResponse.data);
        } catch (error) {
          console.log('Token validation failed:');
          if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response data:', error.response.data);
          } else {
            console.log('Error:', error.message);
          }
        }
      }
    } catch (error) {
      console.log('Login failed:');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Response data:', error.response.data);
      } else {
        console.log('Error:', error.message);
      }
    }
    
    // Test login endpoint with incorrect credentials
    console.log('\n4. Testing login endpoint with incorrect credentials:');
    try {
      const invalidLoginResponse = await axios.post(`${API_URL}/auth/login`, {
        username: testUser.username,
        password: 'wrong_password'
      });
      console.log('Login successful (unexpected):');
      console.log('Response:', invalidLoginResponse.data);
    } catch (error) {
      console.log('Login failed (expected):');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Response data:', error.response.data);
      } else {
        console.log('Error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('Test script error:', error);
  }
}

testAuthEndpoints(); 