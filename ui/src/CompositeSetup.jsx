import { useEffect, useState } from 'react';
import BackupList from './components/BackupList';
import ConfigFileSection from './components/ConfigFileSection';
import ConfigViewerModal from './components/ConfigViewerModal';
import MessageDisplay from './components/MessageDisplay';
import ServerControl from './components/ServerControl';
import SetupHeader from './components/SetupHeader';
import WhatThisDoesSection from './components/WhatThisDoesSection';
import { useConfigManagement } from './hooks/useConfigManagement';
import { useServiceExtraction } from './hooks/useServiceExtraction';
import { colors } from './theme';

function CompositeSetup() {
  const [fileContent, setFileContent] = useState('');
  const [filePath, setFilePath] = useState('');
  const [updatePath, setUpdatePath] = useState('');
  const [status, setStatus] = useState({ running: false, pid: null });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const { services, selectedServices, setSelectedServices } = useServiceExtraction(
    fileContent,
    filePath
  );

  const {
    detectedPaths,
    detecting,
    detectConfigPaths,
    backups,
    loadingBackups,
    loadBackups,
    viewingConfig,
    configContent,
    loadingConfig,
    handleViewConfig,
    setViewingConfig,
    setConfigContent,
    viewingBackup,
    backupContent,
    loadingBackup,
    handleViewBackup,
    handleDeleteBackup,
    setViewingBackup,
    setBackupContent,
  } = useConfigManagement();

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRestore = async (backupPath, originalPath) => {
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
        body: JSON.stringify({ backupPath, originalPath }),
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

  const handleDelete = async (backupPath) => {
    const success = await handleDeleteBackup(backupPath);
    if (success) {
      setMessage('Backup deleted successfully');
      setError(null);
    } else {
      setError('Failed to delete backup');
      setMessage(null);
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
          data.message?.includes('restored')
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
        <SetupHeader />

        <ConfigFileSection
          detectedPaths={detectedPaths}
          detecting={detecting}
          onDetect={detectConfigPaths}
          onPathSelect={(path) => {
            setFilePath(path);
            setFileContent('');
            setUpdatePath(path);
          }}
          onViewConfig={handleViewConfig}
          filePath={filePath}
          fileContent={fileContent}
          updatePath={updatePath}
          onFileSelect={handleFileSelect}
          onPathChange={handlePathInput}
          onUpdatePathChange={handleUpdatePathInput}
          services={services}
          selectedServices={selectedServices}
          onSelectionChange={setSelectedServices}
        />

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
          onView={handleViewBackup}
          onDelete={handleDelete}
        />

        <WhatThisDoesSection filePath={filePath} updatePath={updatePath} />
      </div>

      <ConfigViewerModal
        viewingConfig={viewingConfig}
        configContent={configContent}
        loadingConfig={loadingConfig}
        viewingBackup={viewingBackup}
        backupContent={backupContent}
        loadingBackup={loadingBackup}
        onClose={() => {
          setViewingConfig(null);
          setConfigContent(null);
          setViewingBackup(null);
          setBackupContent(null);
        }}
      />
    </div>
  );
}

export default CompositeSetup;
