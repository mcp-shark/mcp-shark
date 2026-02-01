import { useEffect, useState } from 'react';
import { colors, fonts } from '../theme';
import { isEmbeddedInExtension } from '../utils/embedInExtension';

const MESSAGE_TYPE_REQUEST = 'mcp-shark-viewer/requestLlmAnalysis';
const MESSAGE_TYPE_RESULT = 'mcp-shark-viewer/requestLlmAnalysisResult';

/**
 * UI shown only when MCP Shark is loaded inside the VS Code / Cursor extension (MCP Shark Viewer).
 * Provides a bar and "Analyze with IDE LLM" action that uses the extension's language model.
 */
export default function ExtensionOnlyUI() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState(
    'Summarize the current MCP traffic and highlight any security or correctness concerns.'
  );

  useEffect(() => {
    setVisible(isEmbeddedInExtension());
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      const data = event.data;
      if (data?.type !== MESSAGE_TYPE_RESULT) return;
      setLoading(false);
      if (data.error) {
        setError(data.error);
        setResult(null);
      } else {
        setError(null);
        setResult(data.result ?? '');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const requestLlmAnalysis = () => {
    if (!window.parent || window.parent === window) return;
    setLoading(true);
    setError(null);
    setResult(null);
    window.parent.postMessage(
      {
        type: MESSAGE_TYPE_REQUEST,
        prompt: prompt || 'Summarize the current MCP traffic and highlight any concerns.',
        context: '',
      },
      '*'
    );
  };

  if (!visible) return null;

  return (
    <div
      style={{
        background: colors.bgSecondary,
        borderBottom: `1px solid ${colors.borderLight}`,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        fontFamily: fonts.body,
        fontSize: '13px',
      }}
      data-embed="vscode-viewer"
    >
      <span style={{ color: colors.textSecondary, fontWeight: 500 }}>
        Running in VS Code / Cursor
      </span>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Analysis prompt..."
        style={{
          flex: '1',
          minWidth: '200px',
          padding: '6px 10px',
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: fonts.body,
        }}
      />
      <button
        type="button"
        onClick={requestLlmAnalysis}
        disabled={loading}
        style={{
          padding: '6px 14px',
          background: loading ? colors.borderMedium : colors.buttonPrimary,
          color: colors.textInverse,
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'wait' : 'pointer',
          fontSize: '12px',
          fontWeight: 500,
        }}
      >
        {loading ? 'Analyzing…' : 'Analyze with IDE LLM'}
      </button>
      {(result != null || error) && (
        <div
          style={{
            width: '100%',
            marginTop: '8px',
            padding: '10px',
            background: error ? colors.errorBg : colors.bgCard,
            border: `1px solid ${error ? colors.error : colors.borderLight}`,
            borderRadius: '6px',
            fontSize: '12px',
            color: error ? colors.error : colors.textPrimary,
            whiteSpace: 'pre-wrap',
            maxHeight: '200px',
            overflow: 'auto',
          }}
        >
          {error ?? result}
        </div>
      )}
    </div>
  );
}
