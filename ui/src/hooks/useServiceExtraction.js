import { useState, useEffect, useCallback } from 'react';

export function useServiceExtraction(fileContent, filePath) {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState(new Set());
  const [loadingServices, setLoadingServices] = useState(false);

  const extractServices = useCallback(async () => {
    if (!fileContent && !filePath) {
      setServices([]);
      setSelectedServices(new Set());
      return;
    }

    setLoadingServices(true);
    try {
      const payload = fileContent ? { fileContent } : { filePath };
      const res = await fetch('/api/config/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.services) {
        setServices(data.services);
        setSelectedServices(new Set(data.services.map((s) => s.name)));
      } else {
        setServices([]);
        setSelectedServices(new Set());
      }
    } catch (err) {
      console.error('Failed to extract services:', err);
      setServices([]);
      setSelectedServices(new Set());
    } finally {
      setLoadingServices(false);
    }
  }, [fileContent, filePath]);

  useEffect(() => {
    if (fileContent || filePath) {
      extractServices();
    } else {
      setServices([]);
      setSelectedServices(new Set());
    }
  }, [fileContent, filePath, extractServices]);

  return { services, selectedServices, setSelectedServices, loadingServices };
}
