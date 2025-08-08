// Debug route to test form data submission
import React, { useState } from 'react';
import { toast } from 'react-toastify';

function DebugForm() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTestFetch = async () => {
    setLoading(true);
    try {
      // Create a simple FormData object
      const formData = new FormData();
      formData.append('fullName', 'Debug Test');
      formData.append('phone', '1234567890');
      formData.append('email', 'debug@test.com');
      formData.append('hasPrescription', 'no');
      formData.append('purchaseWithoutPrescription', 'no');
      formData.append('message', 'This is a debug test submission');
      
      // Create a test file (text blob)
      const textFile = new Blob(['Debug test file content'], { type: 'text/plain' });
      formData.append('debugFile', textFile, 'debug.txt');
      
      // Log form data entries
      console.log('Debug FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof Blob ? `File: ${pair[1].size} bytes` : pair[1]));
      }
      
      // Make a fetch request directly to the server
      const response = await fetch('http://localhost:5000/api/medical-query', {
        method: 'POST',
        body: formData,
        // Do not set Content-Type header for FormData
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      // Get the response text
      const responseText = await response.text();
      
      // Try to parse as JSON
      try {
        const responseData = JSON.parse(responseText);
        setResult({
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          data: responseData
        });
      } catch (e) {
        setResult({
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          text: responseText
        });
      }
      
      if (response.ok) {
        toast.success('Debug form submitted successfully');
      } else {
        toast.error(`Debug form submission failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Debug form error:', error);
      setResult({
        error: error.message
      });
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleXhrTest = () => {
    setLoading(true);
    
    // Create FormData
    const formData = new FormData();
    formData.append('fullName', 'XHR Test');
    formData.append('phone', '9876543210');
    formData.append('email', 'xhr@test.com');
    formData.append('hasPrescription', 'no');
    formData.append('purchaseWithoutPrescription', 'yes');
    formData.append('message', 'Test with raw XHR');
    
    // Create XHR request
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:5000/api/medical-query', true);
    
    // Add authorization headers
    const token = localStorage.getItem('token');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('x-auth-token', token);
    }
    
    // Add event listeners
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Success
        try {
          const response = JSON.parse(xhr.responseText);
          setResult({
            status: xhr.status,
            success: true,
            data: response
          });
          toast.success('XHR test submitted successfully');
        } catch (e) {
          setResult({
            status: xhr.status,
            success: true,
            text: xhr.responseText
          });
          toast.success('XHR test submitted successfully (non-JSON response)');
        }
      } else {
        // Error
        try {
          const response = JSON.parse(xhr.responseText);
          setResult({
            status: xhr.status,
            success: false,
            error: response.error || response.message || 'Unknown error'
          });
        } catch (e) {
          setResult({
            status: xhr.status,
            success: false,
            text: xhr.responseText
          });
        }
        toast.error(`XHR test failed: ${xhr.status}`);
      }
      setLoading(false);
    };
    
    xhr.onerror = function() {
      setResult({
        success: false,
        error: 'Network error'
      });
      toast.error('XHR network error');
      setLoading(false);
    };
    
    // Send the request
    xhr.send(formData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mt-4">
      <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">API Debug Tools</h3>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <button
            onClick={handleTestFetch}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            Test with Fetch API
          </button>
          
          <button
            onClick={handleXhrTest}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
          >
            Test with XHR
          </button>
        </div>
        
        {loading && (
          <div className="text-gray-600 dark:text-gray-400">
            Testing submission...
          </div>
        )}
        
        {result && (
          <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
            <div className="font-bold mb-2">
              Status: {result.status} 
              {result.success ? 
                <span className="text-green-500 ml-2">Success</span> : 
                <span className="text-red-500 ml-2">Error</span>
              }
            </div>
            <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-40 p-2 bg-gray-100 dark:bg-gray-800 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default DebugForm;
