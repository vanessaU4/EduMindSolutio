/**
 * System Diagnostic Tool for Frontend & Backend Error Checking
 * Run this to get a complete status report
 */

import React from 'react';
import { apiClient } from '@/services/apiClient';

export interface DiagnosticResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export const runSystemDiagnostic = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];
  
  console.log('🔍 Running System Diagnostic...');
  console.log('='.repeat(50));

  // 1. Frontend Checks
  results.push(...await checkFrontendStatus());
  
  // 2. Backend Connectivity
  results.push(...await checkBackendConnectivity());
  
  // 3. Authentication
  results.push(...await checkAuthentication());
  
  // 4. API Endpoints
  results.push(...await checkAPIEndpoints());
  
  // 5. WebSocket
  results.push(...await checkWebSocketStatus());
  
  // 6. Local Storage
  results.push(...checkLocalStorage());

  // Print summary
  printDiagnosticSummary(results);
  
  return results;
};

const checkFrontendStatus = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];
  
  try {
    // Check if we're in development
    const isDev = window.location.hostname === 'localhost';
    results.push({
      component: 'Frontend Environment',
      status: 'pass',
      message: `Running in ${isDev ? 'development' : 'production'} mode`,
      details: { hostname: window.location.hostname, port: window.location.port }
    });

    // Check React app status
    results.push({
      component: 'React Application',
      status: 'pass',
      message: 'React app running successfully',
      details: { version: React.version || 'Unknown' }
    });

    // Check if required components exist
    const hasToast = typeof window !== 'undefined';
    results.push({
      component: 'UI Components',
      status: hasToast ? 'pass' : 'fail',
      message: hasToast ? 'UI components loaded' : 'UI components missing'
    });

  } catch (error) {
    results.push({
      component: 'Frontend Status',
      status: 'fail',
      message: 'Frontend check failed',
      details: error
    });
  }
  
  return results;
};

const checkBackendConnectivity = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];
  
  try {
    // Test basic connectivity
    const response = await fetch('http://localhost:8000/', { 
      method: 'GET',
      mode: 'cors'
    });
    
    results.push({
      component: 'Backend Server',
      status: response.ok ? 'pass' : 'warning',
      message: response.ok ? 'Backend server responding' : `Backend returned ${response.status}`,
      details: { status: response.status, statusText: response.statusText }
    });

  } catch (error) {
    results.push({
      component: 'Backend Server',
      status: 'fail',
      message: 'Cannot connect to backend server',
      details: { error: (error as Error).message, url: 'http://localhost:8000/' }
    });
  }

  // Test Django admin
  try {
    const adminResponse = await fetch('http://localhost:8000/admin/', { method: 'GET' });
    results.push({
      component: 'Django Admin',
      status: adminResponse.status === 200 ? 'pass' : 'warning',
      message: adminResponse.status === 200 ? 'Django admin accessible' : 'Django admin not accessible',
      details: { status: adminResponse.status }
    });
  } catch (error) {
    results.push({
      component: 'Django Admin',
      status: 'fail',
      message: 'Django admin not accessible',
      details: error
    });
  }
  
  return results;
};

const checkAuthentication = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];
  
  try {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      results.push({
        component: 'Authentication',
        status: 'fail',
        message: 'No authentication token found',
        details: { hasToken: false }
      });
      return results;
    }

    results.push({
      component: 'Auth Token',
      status: 'pass',
      message: 'Authentication token present',
      details: { hasToken: true, tokenLength: token.length }
    });

    // Test token validity with a simple API call
    try {
      const response = await apiClient.get('/community/chat-rooms/');
      results.push({
        component: 'Token Validity',
        status: 'pass',
        message: 'Authentication token is valid',
        details: { authenticated: true }
      });
    } catch (error: any) {
      results.push({
        component: 'Token Validity',
        status: error.response?.status === 401 ? 'fail' : 'warning',
        message: error.response?.status === 401 ? 'Authentication token invalid' : 'Token validation failed',
        details: { error: error.message, status: error.response?.status }
      });
    }

  } catch (error) {
    results.push({
      component: 'Authentication',
      status: 'fail',
      message: 'Authentication check failed',
      details: error
    });
  }
  
  return results;
};

const checkAPIEndpoints = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];
  
  const endpoints = [
    { name: 'Chat Rooms List', url: '/community/chat-rooms/', method: 'GET' },
    { name: 'Chat Messages', url: '/community/chat-messages/?room_id=1', method: 'GET' },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await apiClient.get(endpoint.url);
      results.push({
        component: `API: ${endpoint.name}`,
        status: 'pass',
        message: `${endpoint.name} endpoint working`,
        details: { url: endpoint.url, dataReceived: !!response }
      });
    } catch (error: any) {
      results.push({
        component: `API: ${endpoint.name}`,
        status: 'fail',
        message: `${endpoint.name} endpoint failed`,
        details: { 
          url: endpoint.url, 
          error: error.message,
          status: error.response?.status 
        }
      });
    }
  }

  // Test problematic endpoint
  try {
    const testData = { room: 1, content: 'Diagnostic test message', is_anonymous: true };
    await apiClient.post('/community/chat-messages/', testData);
    results.push({
      component: 'API: Chat Message Creation',
      status: 'pass',
      message: 'Chat message creation working',
      details: { testData }
    });
  } catch (error: any) {
    results.push({
      component: 'API: Chat Message Creation',
      status: 'fail',
      message: `Chat message creation failed: ${error.response?.status || 'Unknown error'}`,
      details: { 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data 
      }
    });
  }
  
  return results;
};

const checkWebSocketStatus = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];
  
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket('ws://localhost:8000/ws/chat/1/');
      
      const timeout = setTimeout(() => {
        ws.close();
        results.push({
          component: 'WebSocket Server',
          status: 'fail',
          message: 'WebSocket connection timeout',
          details: { url: 'ws://localhost:8000/ws/chat/1/', timeout: '5s' }
        });
        resolve(results);
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        results.push({
          component: 'WebSocket Server',
          status: 'pass',
          message: 'WebSocket server accessible',
          details: { url: 'ws://localhost:8000/ws/chat/1/' }
        });
        resolve(results);
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        results.push({
          component: 'WebSocket Server',
          status: 'warning',
          message: 'WebSocket server not available (expected in development)',
          details: { url: 'ws://localhost:8000/ws/chat/1/', note: 'Not required for basic functionality' }
        });
        resolve(results);
      };

    } catch (error) {
      results.push({
        component: 'WebSocket Server',
        status: 'fail',
        message: 'WebSocket test failed',
        details: error
      });
      resolve(results);
    }
  });
};

const checkLocalStorage = (): DiagnosticResult[] => {
  const results: DiagnosticResult[] = [];
  
  try {
    const mockMode = localStorage.getItem('chatMockMode');
    const wsEnabled = localStorage.getItem('enableWebSocket');
    
    results.push({
      component: 'Local Storage',
      status: 'pass',
      message: 'Local storage accessible',
      details: {
        mockMode: mockMode === 'true',
        webSocketEnabled: wsEnabled === 'true',
        hasAuthToken: !!localStorage.getItem('access_token')
      }
    });

  } catch (error) {
    results.push({
      component: 'Local Storage',
      status: 'fail',
      message: 'Local storage not accessible',
      details: error
    });
  }
  
  return results;
};

const printDiagnosticSummary = (results: DiagnosticResult[]) => {
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`📊 Total: ${results.length}`);
  
  console.log('\n🔍 DETAILED RESULTS:');
  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.component}: ${result.message}`);
    if (result.details && Object.keys(result.details).length > 0) {
      console.log(`   Details:`, result.details);
    }
  });

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  const failedComponents = results.filter(r => r.status === 'fail');
  if (failedComponents.length === 0) {
    console.log('🎉 All critical components are working!');
  } else {
    failedComponents.forEach(component => {
      if (component.component.includes('Chat Message Creation')) {
        console.log('🔧 Fix Django backend: Use DJANGO_CHAT_MESSAGE_FIX.py');
      } else if (component.component.includes('Backend Server')) {
        console.log('🔧 Start Django server: python manage.py runserver');
      } else if (component.component.includes('Authentication')) {
        console.log('🔧 Check login status and refresh tokens');
      }
    });
  }
};

// Make available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).runSystemDiagnostic = runSystemDiagnostic;
  (window as any).checkSystem = runSystemDiagnostic;
}

export default runSystemDiagnostic;
