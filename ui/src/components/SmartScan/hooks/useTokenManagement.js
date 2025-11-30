import { useState, useRef, useEffect } from 'react';

export function useTokenManagement() {
  const [apiToken, setApiToken] = useState('');
  const saveTokenTimeoutRef = useRef(null);

  useEffect(() => {
    loadStoredToken();
    return () => {
      if (saveTokenTimeoutRef.current) {
        clearTimeout(saveTokenTimeoutRef.current);
      }
    };
  }, []);

  const loadStoredToken = async () => {
    try {
      const response = await fetch('/api/smartscan/token');
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          setApiToken(data.token);
        }
      }
    } catch (err) {
      console.debug('No stored token found');
    }
  };

  const saveToken = async (token) => {
    try {
      const response = await fetch('/api/smartscan/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        console.error('Failed to save token');
      }
    } catch (err) {
      console.error('Error saving token:', err);
    }
  };

  return {
    apiToken,
    setApiToken,
    saveToken,
    saveTokenTimeoutRef,
  };
}
