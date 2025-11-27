import React, { useState } from 'react';
import { debugAuth, testAuth, quickLogin } from '@/utils/authDebug';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';

const AuthDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleDebugAuth = () => {
    const info = debugAuth();
    setDebugInfo(info);
  };

  const handleTestAuth = async () => {
    setLoading(true);
    try {
      const result = await testAuth();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setLoading(true);
    try {
      await quickLogin();
      // Refresh debug info after login
      handleDebugAuth();
      setTestResult({ success: true, message: 'Login successful' });
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setDebugInfo(null);
    setTestResult(null);
    window.location.reload(); // Refresh to update Redux state
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔍 Authentication Debugger</h2>
      
      {/* Redux State Info */}
      <div className="mb-4 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">Redux Auth State:</h3>
        <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
        <p><strong>User:</strong> {user ? `${user.email} (${user.role})` : 'None'}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleDebugAuth}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Debug Auth State
        </button>
        <button
          onClick={handleTestAuth}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API Auth'}
        </button>
        <button
          onClick={handleQuickLogin}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Quick Login (admin@edumindsolution.com)'}
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Debug Info Display */}
      {debugInfo && (
        <div className="mb-4 p-4 bg-yellow-50 rounded">
          <h3 className="font-semibold mb-2">Debug Information:</h3>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      {/* Test Results */}
      {testResult && (
        <div className={`p-4 rounded ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <h3 className="font-semibold mb-2">
            {testResult.success ? '✅ Test Result' : '❌ Test Failed'}
          </h3>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">🔧 Troubleshooting Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click "Debug Auth State" to check current authentication status</li>
          <li>If not authenticated, click "Quick Login" to log in with test credentials</li>
          <li>Click "Test API Auth" to verify API authentication is working</li>
          <li>If tests pass, the 401 errors should be resolved</li>
          <li>Check browser console for additional debugging information</li>
        </ol>
      </div>
    </div>
  );
};

export default AuthDebugger;
