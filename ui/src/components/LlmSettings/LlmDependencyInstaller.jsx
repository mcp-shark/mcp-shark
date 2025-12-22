import { useEffect, useState } from 'react';
import { colors, fonts } from '../../theme';
import { Notice } from './LlmSettingsUi.jsx';

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

function LogBox({ lines }) {
  const content = (lines || []).join('\n');
  return (
    <pre
      style={{
        marginTop: '10px',
        padding: '10px 12px',
        borderRadius: '10px',
        border: `1px solid ${colors.borderLight}`,
        background: colors.bgSecondary,
        color: colors.textSecondary,
        fontFamily: fonts.mono,
        fontSize: '11px',
        maxHeight: '180px',
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
      }}
    >
      {content || 'No output yet.'}
    </pre>
  );
}

export default function LlmDependencyInstaller({ llmRuntime, disabled, onInstalled }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const poll = async () => {
      try {
        const res = await fetch('/api/llm/deps/status', { signal: controller.signal });
        const data = await res.json();
        setStatus(data);
        if (data?.installed && onInstalled) {
          onInstalled();
        }
      } catch (_err) {
        // ignore
      }
    };

    poll();
    const interval = setInterval(poll, 1500);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [onInstalled]);

  const installed = llmRuntime?.nodeLlamaCppInstalled === true || status?.installed === true;
  if (installed) {
    return null;
  }

  const install = async () => {
    setLoading(true);
    try {
      await fetch('/api/llm/deps/install', { method: 'POST' });
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    setLoading(true);
    try {
      await fetch('/api/llm/deps/cancel', { method: 'POST' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '6px' }}>
      <Notice tone="danger" title="Local LLM dependency missing">
        MCP Shark can’t load local models because{' '}
        <span style={{ color: colors.textPrimary }}>node-llama-cpp</span> is not installed.
      </Notice>

      <div style={{ display: 'flex', gap: '10px', marginTop: '12px', alignItems: 'center' }}>
        <Button onClick={install} disabled={disabled || loading || status?.running} tone="primary">
          {status?.running ? 'Installing…' : 'Install (npm install)'}
        </Button>
        <Button onClick={cancel} disabled={disabled || loading || !status?.running}>
          Cancel
        </Button>
        <div style={{ fontFamily: fonts.body, fontSize: '12px', color: colors.textSecondary }}>
          Runs locally in your MCP Shark repo.
        </div>
      </div>

      <LogBox lines={status?.logTail || []} />
    </div>
  );
}
