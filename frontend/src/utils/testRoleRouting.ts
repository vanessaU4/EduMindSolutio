/**
 * Test utility to verify role-based routing functionality
 * This can be used in development to test different user roles
 */

import { authService } from '@/services/authService';

export const testUsers = {
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    expectedRoute: '/admin'
  },
  guide: {
    email: 'guide@example.com', 
    password: 'guide123',
    expectedRoute: '/guide'
  },
  user: {
    email: 'test@example.com',
    password: 'testpass123',
    expectedRoute: '/dashboard'
  }
};

export const testRoleRouting = async (userType: keyof typeof testUsers) => {
  const testUser = testUsers[userType];
  
  try {
    console.log(`Testing login for ${userType}...`);
    
    // Login with test user
    const response = await authService.login({
      email: testUser.email,
      password: testUser.password
    });
    
    console.log(`✅ Login successful for ${userType}`);
    console.log(`User role: ${response.user.role}`);
    console.log(`Expected route: ${testUser.expectedRoute}`);
    console.log(`Onboarding completed: ${response.user.onboarding_completed}`);
    
    return {
      success: true,
      user: response.user,
      expectedRoute: testUser.expectedRoute
    };
    
  } catch (error) {
    console.error(`❌ Login failed for ${userType}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Test all user types
export const testAllRoles = async () => {
  console.log('🧪 Testing role-based routing for all user types...\n');
  
  for (const userType of Object.keys(testUsers) as Array<keyof typeof testUsers>) {
    await testRoleRouting(userType);
    console.log('---');
    
    // Logout after each test
    authService.logout();
  }
  
  console.log('✅ Role routing tests completed');
};

// Usage in browser console:
// import { testAllRoles, testRoleRouting } from '@/utils/testRoleRouting';
// testAllRoles(); // Test all roles
// testRoleRouting('admin'); // Test specific role
