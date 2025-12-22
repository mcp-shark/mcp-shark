import { useEffect, useMemo, useState } from 'react';
import { colors, fonts } from '../../theme';
import { Notice, Select, TextInput } from './LlmSettingsUi.jsx';

function formatBytes(bytes) {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes)) {
    return '-';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  const idx = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** idx;
  return `${Math.round(value * 10) / 10}${units[idx]}`;
}

function Button({ children, onClick, disabled, tone = 'secondary' }) {
  const background = tone === 'primary' ? colors.accentBlue : colors.bgSecondary;
  const color = tone === 'primary' ? 'white' : colors.textPrimary;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '10px 14px',
        borderRadius: '10px',
        border: `1px solid ${colors.borderLight}`,
        background,
        color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: fonts.body,
        fontSize: '13px',
        fontWeight: '600',
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  );
}

function ProgressBar({ percent }) {
  const value = typeof percent === 'number' ? Math.max(0, Math.min(100, percent)) : 0;
  return (
    <div
      style={{
        height: '10px',
        borderRadius: '999px',
        border: `1px solid ${colors.borderLight}`,
        background: colors.bgSecondary,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: '100%',
          background: colors.accentBlue,
        }}
      />
    </div>
  );
}

export default function LlmModelDownloader({
  paths,
  disabled,
  availableModels,
  onRefreshSettings,
}) {
  const [catalog, setCatalog] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [selectedId, setSelectedId] = useState('custom');
  const [customUrl, setCustomUrl] = useState('');
  const [customFileName, setCustomFileName] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadCatalog = async () => {
      try {
        const res = await fetch('/api/llm/catalog', { signal: controller.signal });
        const data = await res.json();
        setCatalog(data.models || []);
      } catch (_err) {
        // ignore
      }
    };
    loadCatalog();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const poll = async () => {
      try {
        const res = await fetch('/api/llm/download/status', { signal: controller.signal });
        const data = await res.json();
        setDownloadStatus(data);
        if (data?.done && !data?.running && onRefreshSettings) {
          onRefreshSettings();
        }
      } catch (_err) {
        // ignore
      }
    };

    poll();
    const interval = setInterval(poll, 1000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [onRefreshSettings]);

  const options = useMemo(() => {
    const catalogOptions = catalog.map((m) => ({ label: m.name, value: m.id }));
    return [{ label: 'Custom URL…', value: 'custom' }, ...catalogOptions];
  }, [catalog]);

  const selectedModel = catalog.find((m) => m.id === selectedId) || null;
  const effectiveUrl = selectedModel ? selectedModel.url : customUrl;
  const effectiveFileName = selectedModel ? selectedModel.fileName : customFileName;

  const startDownload = async () => {
    setError(null);
    setMessage(null);
    try {
      if (!effectiveUrl || !effectiveFileName) {
        setError('Please provide both URL and file name');
        return;
      }
      const res = await fetch('/api/llm/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: effectiveUrl, fileName: effectiveFileName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorMsg = data?.error || data?.details || `Download failed (${res.status})`;
        throw new Error(errorMsg);
      }
      setMessage('Download started');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg || 'Download failed');
    }
  };

  const cancelDownload = async () => {
    setError(null);
    setMessage(null);
    try {
      await fetch('/api/llm/download/cancel', { method: 'POST' });
      setMessage('Download cancelled');
    } catch (err) {
      setError(err.message || 'Cancel failed');
    }
  };

  const running = downloadStatus?.running;
  const percent = downloadStatus?.percent;
  const downloaded = downloadStatus?.downloadedBytes;
  const total = downloadStatus?.totalBytes;

  return (
    <div style={{ marginTop: '12px' }}>
      <div
        style={{
          fontFamily: fonts.body,
          fontSize: '12px',
          color: colors.textSecondary,
          marginBottom: '10px',
        }}
      >
        Models directory:{' '}
        <span style={{ color: colors.textPrimary }}>
          {paths?.modelsDirectory?.display || '~/.mcp-shark/models'}
        </span>
      </div>

      <Notice tone="info" title="Download a GGUF model">
        Pick a recommended model or paste a direct download URL. Downloads are saved into the models
        directory above.
      </Notice>

      <div style={{ display: 'flex', gap: '12px', marginTop: '12px', alignItems: 'center' }}>
        <div style={{ width: '360px' }}>
          <Select
            value={selectedId}
            onChange={setSelectedId}
            options={options}
            disabled={disabled || running}
          />
        </div>
        <Button
          onClick={startDownload}
          disabled={disabled || running || !effectiveUrl || !effectiveFileName}
          tone="primary"
        >
          {running ? 'Downloading…' : 'Download'}
        </Button>
        <Button onClick={cancelDownload} disabled={disabled || !running}>
          Cancel
        </Button>
        {onRefreshSettings && (
          <Button onClick={onRefreshSettings} disabled={disabled || running}>
            Refresh
          </Button>
        )}
      </div>

      {selectedId === 'custom' && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <div style={{ flex: 1 }}>
            <TextInput
              value={customUrl}
              onChange={setCustomUrl}
              placeholder="https://…/model.gguf"
              disabled={disabled || running}
            />
          </div>
          <div style={{ width: '360px' }}>
            <TextInput
              value={customFileName}
              onChange={setCustomFileName}
              placeholder="Model file name (e.g., Qwen2.5-1.5B-Instruct-Q4_K_M.gguf)"
              disabled={disabled || running}
            />
          </div>
        </div>
      )}

      {running && (
        <div style={{ marginTop: '12px' }}>
          <ProgressBar percent={percent || 0} />
          <div
            style={{
              marginTop: '6px',
              fontFamily: fonts.body,
              fontSize: '12px',
              color: colors.textSecondary,
            }}
          >
            {typeof percent === 'number' ? `${percent}%` : 'Downloading…'} •{' '}
            {formatBytes(downloaded)} / {total ? formatBytes(total) : 'unknown'}
          </div>
        </div>
      )}

      {message && (
        <div
          style={{
            marginTop: '10px',
            fontFamily: fonts.body,
            fontSize: '13px',
            color: colors.accentGreen,
          }}
        >
          {message}
        </div>
      )}
      {error && (
        <div
          style={{
            marginTop: '10px',
            fontFamily: fonts.body,
            fontSize: '13px',
            color: colors.accentRed,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginTop: '12px' }}>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: '12px',
            color: colors.textSecondary,
            marginBottom: '6px',
          }}
        >
          Installed models:
        </div>
        {availableModels?.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {availableModels.map((m) => (
              <div
                key={m.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  border: `1px solid ${colors.borderLight}`,
                  borderRadius: '10px',
                  background: colors.bgSecondary,
                  fontFamily: fonts.body,
                  fontSize: '12px',
                  color: colors.textPrimary,
                }}
              >
                <span>{m.name}</span>
                <span style={{ color: colors.textSecondary }}>{formatBytes(m.sizeBytes)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontFamily: fonts.body, fontSize: '12px', color: colors.textSecondary }}>
            No models found yet.
          </div>
        )}
      </div>
    </div>
  );
}
