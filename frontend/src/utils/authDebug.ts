import { authService } from '@/services/authService';

/**
 * Debug utility to check authentication state
 */
export const debugAuth = () => {
  const token = authService.getAccessToken();
  const refreshToken = authService.getRefreshToken();
  const user = authService.getUser();
  const isAuthenticated = authService.isAuthenticated();

  console.group('🔍 Authentication Debug Info');
  console.log('📊 Authentication Status:', isAuthenticated);
  console.log('👤 User:', user);
  console.log('🔑 Access Token:', token ? `${token.substring(0, 20)}...` : 'None');
  console.log('🔄 Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'None');
  
  // Check localStorage directly
  console.log('💾 localStorage access_token:', localStorage.getItem('access_token') ? 'Present' : 'Missing');
  console.log('💾 localStorage refresh_token:', localStorage.getItem('refresh_token') ? 'Present' : 'Missing');
  console.log('💾 localStorage user:', localStorage.getItem('user') ? 'Present' : 'Missing');
  
  console.groupEnd();

  return {
    isAuthenticated,
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
    hasUser: !!user,
    user,
    tokenPreview: token ? `${token.substring(0, 20)}...` : null
  };
};

/**
 * Test API authentication with a simple endpoint
 */
export const testAuth = async () => {
  const authInfo = debugAuth();
  
  if (!authInfo.isAuthenticated) {
    console.warn('⚠️ User is not authenticated. Please log in first.');
    return { success: false, error: 'Not authenticated' };
  }

  try {
    // Test with a simple authenticated endpoint
    const response = await fetch('http://localhost:8000/api/accounts/me/', {
      headers: {
        'Authorization': `Bearer ${authService.getAccessToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('✅ Authentication test successful:', userData);
      return { success: true, data: userData };
    } else {
      console.error('❌ Authentication test failed:', response.status, response.statusText);
      return { success: false, error: `${response.status} ${response.statusText}` };
    }
  } catch (error) {
    console.error('❌ Authentication test error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Quick login helper for testing
 */
export const quickLogin = async (email: string = 'admin@edumindsolution.com', password: string = 'EduMind2024!') => {
  try {
    console.log('🔐 Attempting quick login...');
    const result = await authService.login({ email, password });
    console.log('✅ Login successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  }
};
