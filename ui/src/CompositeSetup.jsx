import { useState, useEffect, useCallback } from 'react';
import { colors, fonts } from './theme';
import DetectedPathsList from './components/DetectedPathsList';
import FileInput from './components/FileInput';
import ServiceSelector from './components/ServiceSelector';
import ServerControl from './components/ServerControl';
import MessageDisplay from './components/MessageDisplay';
import BackupList from './components/BackupList';
import ConfigViewerModal from './components/ConfigViewerModal';

function CompositeSetup() {
  const [fileContent, setFileContent] = useState('');
  const [filePath, setFilePath] = useState('');
  const [updatePath, setUpdatePath] = useState('');
  const [status, setStatus] = useState({ running: false, pid: null });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [detectedPaths, setDetectedPaths] = useState([]);
  const [detecting, setDetecting] = useState(true);
  const [viewingConfig, setViewingConfig] = useState(null);
  const [configContent, setConfigContent] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
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
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    detectConfigPaths();
    loadBackups();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (fileContent || filePath) {
      extractServices();
    } else {
      setServices([]);
      setSelectedServices(new Set());
    }
  }, [fileContent, filePath, extractServices]);

  const detectConfigPaths = async () => {
    setDetecting(true);
    try {
      const res = await fetch('/api/config/detect');
      const data = await res.json();
      setDetectedPaths(data.detected || []);
    } catch (err) {
      console.error('Failed to detect config paths:', err);
    } finally {
      setDetecting(false);
    }
  };

  const loadBackups = async () => {
    setLoadingBackups(true);
    try {
      const res = await fetch('/api/config/backups');
      const data = await res.json();
      setBackups(data.backups || []);
    } catch (err) {
      console.error('Failed to load backups:', err);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleRestore = async (backupPath) => {
    if (
      !confirm(
        'Are you sure you want to restore this backup? This will overwrite the current config file.'
      )
    ) {
      return;
    }

    try {
      const res = await fetch('/api/config/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupPath }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Config restored successfully');
        setError(null);
        loadBackups();
        detectConfigPaths();
      } else {
        setError(data.error || 'Failed to restore backup');
        setMessage(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to restore backup');
      setMessage(null);
    }
  };

  const handleViewConfig = async (filePath) => {
    setLoadingConfig(true);
    setViewingConfig(filePath);
    try {
      const res = await fetch(`/api/config/read?filePath=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      if (res.ok) {
        setConfigContent(data);
      } else {
        setError(data.error || 'Failed to read config file');
        setConfigContent(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to read config file');
      setConfigContent(null);
    } finally {
      setLoadingConfig(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/composite/status');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handlePathInput = (e) => {
    const value = e.target.value;
    setFilePath(value);
    if (value) {
      setFileContent('');
    }
  };

  const handleUpdatePathInput = (e) => {
    setUpdatePath(e.target.value);
  };

  const handleSetup = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const payload = fileContent ? { fileContent, filePath: updatePath || null } : { filePath };

      if (selectedServices.size > 0) {
        payload.selectedServices = Array.from(selectedServices);
      }

      const res = await fetch('/api/composite/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        const msg = data.message || 'MCP Shark server started successfully';
        setMessage(data.backupPath ? `${msg} (Backup saved to ${data.backupPath})` : msg);
        setFileContent('');
        setFilePath('');
        setUpdatePath('');
        setServices([]);
        setSelectedServices(new Set());
        setTimeout(fetchStatus, 1000);
      } else {
        setError(data.error || 'Failed to setup MCP Shark server');
      }
    } catch (err) {
      setError(err.message || 'Failed to setup MCP Shark server');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/composite/stop', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        const msg = data.message || 'MCP Shark server stopped';
        setMessage(
          data.message && data.message.includes('restored')
            ? 'MCP Shark server stopped and original config file restored'
            : msg
        );
        setTimeout(fetchStatus, 1000);
      } else {
        setError(data.error || 'Failed to stop MCP Shark server');
      }
    } catch (err) {
      setError(err.message || 'Failed to stop MCP Shark server');
    } finally {
      setLoading(false);
    }
  };

  const canStart =
    (fileContent || filePath) && (services.length === 0 || selectedServices.size > 0);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: colors.bgPrimary,
        overflow: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px',
          minHeight: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '8px',
              color: colors.textPrimary,
              fontFamily: fonts.body,
            }}
          >
            MCP Shark Server Setup
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: colors.textSecondary,
              lineHeight: '1.6',
              fontFamily: fonts.body,
            }}
          >
            Convert your MCP configuration file and start the MCP Shark server to aggregate multiple
            MCP servers into a single endpoint.
          </p>
        </div>

        <div
          style={{
            background: colors.bgCard,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '6px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: '600',
                marginBottom: '8px',
                color: colors.textPrimary,
                fontFamily: fonts.body,
              }}
            >
              Configuration File
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: colors.textSecondary,
                lineHeight: '1.5',
                fontFamily: fonts.body,
              }}
            >
              Select your MCP configuration file or provide a file path. The file will be converted
              to MCP Shark format and used to start the server.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <DetectedPathsList
              detectedPaths={detectedPaths}
              detecting={detecting}
              onDetect={detectConfigPaths}
              onSelect={(path) => {
                setFilePath(path);
                setFileContent('');
                setUpdatePath(path);
              }}
              onView={handleViewConfig}
            />

            <FileInput
              filePath={filePath}
              fileContent={fileContent}
              updatePath={updatePath}
              onFileSelect={handleFileSelect}
              onPathChange={handlePathInput}
              onUpdatePathChange={handleUpdatePathInput}
            />

            <ServiceSelector
              services={services}
              selectedServices={selectedServices}
              onSelectionChange={setSelectedServices}
            />
          </div>
        </div>

        <ServerControl
          status={status}
          loading={loading}
          onStart={handleSetup}
          onStop={handleStop}
          canStart={canStart}
        />

        <MessageDisplay message={message} error={error} />

        <BackupList
          backups={backups}
          loadingBackups={loadingBackups}
          onRefresh={loadBackups}
          onRestore={handleRestore}
        />

        <div
          style={{
            background: colors.bgCard,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '6px',
            padding: '20px',
          }}
        >
          <h3
            style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: '#d4d4d4' }}
          >
            What This Does
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: '20px',
              fontSize: '13px',
              color: colors.textSecondary,
              lineHeight: '1.8',
            }}
          >
            <li>
              Converts your MCP config (<code style={{ color: '#dcdcaa' }}>mcpServers</code>) to MCP
              Shark format (<code style={{ color: '#dcdcaa' }}>servers</code>)
            </li>
            <li>
              Starts the MCP Shark server on{' '}
              <code style={{ color: '#4ec9b0' }}>http://localhost:9851/mcp</code>
            </li>
            <li>
              {filePath || updatePath
                ? 'Updates your original config file to point to the MCP Shark server (creates a backup first)'
                : 'Note: Provide a file path to update your original config file automatically'}
            </li>
            {(filePath || updatePath) && (
              <li style={{ color: '#89d185', marginTop: '4px' }}>
                ✓ Original config will be automatically restored when you stop the server or close
                the UI
              </li>
            )}
          </ul>
        </div>
      </div>

      <ConfigViewerModal
        viewingConfig={viewingConfig}
        configContent={configContent}
        loadingConfig={loadingConfig}
        onClose={() => {
          setViewingConfig(null);
          setConfigContent(null);
        }}
      />
    </div>
  );
}

export default CompositeSetup;
