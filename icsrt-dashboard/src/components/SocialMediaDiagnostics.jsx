import React, { useState } from 'react';

const SocialMediaDiagnostics = () => {
  const [diagnosticResults, setDiagnosticResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const API_BASE_URL = 'http://localhost:3000';

  const addResult = (test, status, message, data = null) => {
    setDiagnosticResults(prev => [...prev, {
      test,
      status,
      message,
      data,
      timestamp: new Date().toISOString()
    }]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnosticResults([]);

    // Test 1: Check if server is reachable
    try {
      addResult('Server Connectivity', 'testing', 'Testing server connectivity...');
      
      const testResponse = await fetch(`${API_BASE_URL}/test`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (testResponse.ok) {
        const testData = await testResponse.json();
        addResult('Server Connectivity', 'success', 'Server is reachable', testData);
      } else {
        addResult('Server Connectivity', 'error', `Server returned status: ${testResponse.status}`);
      }
    } catch (error) {
      addResult('Server Connectivity', 'error', `Cannot connect to server: ${error.message}`);
    }

    // Test 2: Check social links API
    try {
      addResult('Social Links API', 'testing', 'Testing social links API...');
      
      const response = await fetch(`${API_BASE_URL}/api/social-links`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          addResult('Social Links API', 'success', `API working! Found ${data.data.length} social links`, data);
        } else {
          addResult('Social Links API', 'warning', 'API responded but data format is unexpected', data);
        }
      } else {
        const errorText = await response.text();
        addResult('Social Links API', 'error', `API error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      addResult('Social Links API', 'error', `API request failed: ${error.message}`);
    }

    // Test 3: Test POST functionality
    try {
      addResult('POST Test', 'testing', 'Testing creating a new social link...');
      
      const testData = {
        platform: 'test',
        url: 'https://test.com',
        label: 'Test Link',
        enabled: true
      };

      const response = await fetch(`${API_BASE_URL}/api/social-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          addResult('POST Test', 'success', 'Successfully created test social link', data);
          
          // Clean up - delete the test link
          if (data.data && data.data._id) {
            try {
              const deleteResponse = await fetch(`${API_BASE_URL}/api/social-links/${data.data._id}`, {
                method: 'DELETE'
              });
              if (deleteResponse.ok) {
                addResult('Cleanup', 'success', 'Test link cleaned up successfully');
              }
            } catch (cleanupError) {
              addResult('Cleanup', 'warning', 'Could not clean up test link');
            }
          }
        } else {
          addResult('POST Test', 'error', 'POST request failed', data);
        }
      } else {
        const errorText = await response.text();
        addResult('POST Test', 'error', `POST error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      addResult('POST Test', 'error', `POST request failed: ${error.message}`);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'testing': return '🔄';
      default: return 'ℹ️';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'testing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🧪 Social Media API Diagnostics
        </h2>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
            isRunning 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-105'
          }`}
        >
          {isRunning ? '🔄 Running Tests...' : '🚀 Run Diagnostics'}
        </button>
      </div>

      {diagnosticResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Test Results:</h3>
          {diagnosticResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                result.status === 'success' 
                  ? 'bg-green-50 border-green-500' 
                  : result.status === 'error'
                  ? 'bg-red-50 border-red-500'
                  : result.status === 'warning'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-blue-50 border-blue-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getStatusIcon(result.status)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800">{result.test}</span>
                    <span className={`text-sm ${getStatusColor(result.status)}`}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{result.message}</p>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        View Details
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {diagnosticResults.length === 0 && !isRunning && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">🧪</div>
          <p>Click "Run Diagnostics" to test the Social Media API functionality</p>
        </div>
      )}
    </div>
  );
};

export default SocialMediaDiagnostics;
