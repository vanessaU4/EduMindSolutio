/**
 * API Testing Utilities for debugging backend issues
 */

import { apiClient } from '@/services/apiClient';

export const testBackendConnection = async () => {
  console.log('🔍 Testing Backend Connection...');
  
  try {
    // Test basic connectivity
    const healthCheck = await fetch('http://localhost:8000/api/health/', {
      method: 'GET',
    }).catch(() => null);
    
    if (!healthCheck) {
      console.log('❌ Backend server not responding at http://localhost:8000');
      return false;
    }
    
    console.log('✅ Backend server is responding');
    
    // Test authentication
    const authToken = localStorage.getItem('access_token');
    if (!authToken) {
      console.log('❌ No authentication token found');
      return false;
    }
    
    console.log('✅ Authentication token present');
    
    // Test chat rooms endpoint
    try {
      const rooms = await apiClient.get('/community/chat-rooms/');
      console.log('✅ Chat rooms endpoint working:', rooms);
    } catch (error) {
      console.log('❌ Chat rooms endpoint failed:', error);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
    return false;
  }
};

export const testChatMessageEndpoint = async (roomId: number) => {
  console.log('🔍 Testing Chat Message Endpoint...');
  
  try {
    // Test GET messages first
    const messages = await apiClient.get(`/community/chat-messages/?room_id=${roomId}`);
    console.log('✅ GET messages endpoint working:', messages);
    
    // Test POST message with minimal data
    const testMessage = {
      room: roomId,  // Backend expects 'room', not 'room_id'
      content: 'Test message from frontend',
      is_anonymous: true
    };
    
    console.log('🧪 Testing POST with data:', testMessage);
    
    const response = await fetch('http://localhost:8000/api/community/chat-messages/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(testMessage)
    });
    
    const responseText = await response.text();
    console.log('📤 Raw response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText
    });
    
    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        console.log('❌ Error details:', errorData);
      } catch {
        console.log('❌ Non-JSON error response:', responseText);
      }
    } else {
      console.log('✅ Message sent successfully');
    }
    
  } catch (error) {
    console.error('❌ Chat message endpoint test failed:', error);
  }
};

export const debugChatIssue = async (roomId: number, content: string) => {
  console.log('🐛 Debugging Chat Issue...');
  console.log('='.repeat(50));
  
  // Step 1: Test backend connection
  await testBackendConnection();
  
  // Step 1.5: Test Django admin or simple endpoint
  try {
    const adminTest = await fetch('http://localhost:8000/admin/', { method: 'GET' });
    console.log('✅ Django admin accessible:', adminTest.status);
  } catch (error) {
    console.log('❌ Django admin not accessible:', error);
  }
  
  // Step 2: Test specific room access
  try {
    const room = await apiClient.get(`/community/chat-rooms/${roomId}/`);
    console.log('✅ Room access successful:', room);
  } catch (error) {
    console.log('❌ Room access failed:', error);
  }
  
  // Step 3: Test message endpoint
  await testChatMessageEndpoint(roomId);
  
  // Step 4: Check user permissions
  try {
    const participants = await apiClient.get(`/community/chat-rooms/${roomId}/participants/`);
    console.log('✅ Participants check:', participants);
  } catch (error) {
    console.log('❌ Participants check failed:', error);
  }
  
  console.log('🐛 Debug complete. Check console for details.');
};

// Make functions available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testBackend = testBackendConnection;
  (window as any).testChatMessage = testChatMessageEndpoint;
  (window as any).debugChat = debugChatIssue;
}
