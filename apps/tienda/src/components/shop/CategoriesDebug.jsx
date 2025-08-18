import React, { useState, useEffect } from 'react';

function CategoriesDebug() {
  const [status, setStatus] = useState('initial');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        setStatus('fetching');
        const API_URL = import.meta.env.PUBLIC_API_URL || 
          (import.meta.env.DEV ? 'http://localhost:3001/api' : 'https://entrepeques-api-19a57de16883.herokuapp.com/api');
        
        console.log('Debug - API URL:', API_URL);
        
        // Test direct fetch
        const response = await fetch(`${API_URL}/categories`);
        console.log('Debug - Response status:', response.status);
        console.log('Debug - Response headers:', response.headers);
        
        const text = await response.text();
        console.log('Debug - Raw response:', text);
        
        // Try to parse as JSON
        try {
          const json = JSON.parse(text);
          console.log('Debug - Parsed JSON:', json);
          setData(json);
          setStatus('success');
        } catch (parseError) {
          console.error('Debug - JSON parse error:', parseError);
          setError(`JSON parse error: ${parseError.message}`);
          setStatus('error');
        }
        
      } catch (err) {
        console.error('Debug - Fetch error:', err);
        setError(`Fetch error: ${err.message}`);
        setStatus('error');
      }
    };

    testApi();
  }, []);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
      <h3 className="font-bold text-lg mb-2">API Debug Info:</h3>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>API URL:</strong> {import.meta.env.PUBLIC_API_URL || 
        (import.meta.env.DEV ? 'http://localhost:3001/api' : 'https://entrepeques-api-19a57de16883.herokuapp.com/api')}</p>
      {error && (
        <div className="text-red-600 dark:text-red-400 mt-2">
          <strong>Error:</strong> {error}
        </div>
      )}
      {data && (
        <div className="mt-2">
          <strong>Data received:</strong>
          <pre className="text-xs overflow-auto bg-gray-200 dark:bg-gray-700 p-2 rounded mt-1">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default CategoriesDebug;