import { useEffect, useState } from 'react';

export function useServerStatus() {
  const [serverStatus, setServerStatus] = useState(null);

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const checkServerStatus = async () => {
    try {
      const res = await fetch('/api/composite/status');
      if (!res.ok) {
        throw new Error('Server not available');
      }
      const data = await res.json();
      setServerStatus(data);
    } catch (_err) {
      setServerStatus({ running: false });
    }
  };

  return { serverStatus };
}
