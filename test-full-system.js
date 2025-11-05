// Test Full System - Frontend & Backend
const API_BASE_URL = 'https://santo-fortuneless-elizabeth.ngrok-free.dev/api';

async function testFullSystem() {
  console.log('🧪 Testing Full System...\n');
  
  const results = {
    health: false,
    login: false,
    profile: false,
    cors: false
  };
  
  // Test 1: Health Check
  try {
    console.log('1️⃣ Testing /api/health...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`, {
      headers: { 'x-ngrok-skip-browser-warning': 'true' }
    });
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);
    results.health = true;
  } catch (error) {
    console.error('❌ Health Failed:', error.message);
  }
  
  // Test 2: CORS Check
  try {
    console.log('\n2️⃣ Testing CORS...');
    const corsResponse = await fetch(`${API_BASE_URL}/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://nuimie.netlify.app',
        'x-ngrok-skip-browser-warning': 'true'
      }
    });
    console.log('✅ CORS Headers:', corsResponse.headers.get('access-control-allow-origin'));
    results.cors = corsResponse.status === 200 || corsResponse.status === 204;
  } catch (error) {
    console.error('❌ CORS Failed:', error.message);
  }
  
  // Test 3: Login (use test credentials)
  try {
    console.log('\n3️⃣ Testing /api/auth/login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login Success');
      console.log('   User ID:', loginData.user?.id || loginData.user?._id);
      console.log('   Has _id:', !!loginData.user?._id);
      console.log('   Has id:', !!loginData.user?.id);
      results.login = true;
      
      // Test 4: Get Profile
      if (loginData.user?.id || loginData.user?._id) {
        const userId = loginData.user.id || loginData.user._id;
        console.log(`\n4️⃣ Testing /api/users/${userId}...`);
        const userResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'x-ngrok-skip-browser-warning': 'true'
          }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('✅ Profile Loaded');
          console.log('   Name:', userData.name);
          results.profile = true;
        } else {
          console.error('❌ Profile Failed:', userResponse.status, await userResponse.text());
        }
      }
    } else {
      const errorData = await loginResponse.json();
      console.error('❌ Login Failed:', loginResponse.status, errorData);
    }
  } catch (error) {
    console.error('❌ Login Error:', error.message);
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('Health Check:', results.health ? '✅' : '❌');
  console.log('CORS:', results.cors ? '✅' : '❌');
  console.log('Login:', results.login ? '✅' : '❌');
  console.log('Profile:', results.profile ? '✅' : '❌');
  
  return results;
}

// Run test
testFullSystem().then(results => {
  console.log('\n✅ All tests completed!');
}).catch(error => {
  console.error('❌ Test suite failed:', error);
});

