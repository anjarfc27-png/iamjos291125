'use client'

import { useState } from 'react';

export default function TestLogin() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
      
      if (response.ok) {
        // Test access to editor page
        setTimeout(async () => {
          const editorResponse = await fetch('/editor');
          setResult(prev => prev + '\n\nEditor Page Access: ' + editorResponse.status + ' - ' + editorResponse.url);
        }, 1000);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setResult('Error: ' + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Login Editor</h1>
      <button 
        onClick={() => testLogin('editor@example.com', 'password123')}
        disabled={loading}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        {loading ? 'Testing...' : 'Test Editor Login'}
      </button>
      
      <button 
        onClick={() => testLogin('admin@example.com', 'password123')}
        disabled={loading}
        style={{ padding: '10px 20px', fontSize: '16px', marginLeft: '10px' }}
      >
        {loading ? 'Testing...' : 'Test Admin Login'}
      </button>
      
      {result && (
        <div style={{ marginTop: '20px', whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '10px' }}>
          {result}
        </div>
      )}
    </div>
  );
}
