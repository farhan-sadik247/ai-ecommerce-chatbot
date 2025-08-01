'use client';

import { useState } from 'react';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleSeed = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ Success: ${data.message}`);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Database Seeding</h1>
        <p>Click the button below to seed the database with sample products.</p>
        
        <button
          onClick={handleSeed}
          disabled={loading}
          style={{
            background: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            margin: '2rem 0',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Seeding Database...' : 'Seed Database'}
        </button>

        {result && (
          <div style={{
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: result.includes('✅') ? '#f0f9ff' : '#fef2f2',
            border: `1px solid ${result.includes('✅') ? '#bae6fd' : '#fecaca'}`,
            marginTop: '1rem'
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
