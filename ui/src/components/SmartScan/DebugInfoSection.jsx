import { colors, fonts } from '../../theme';

export default function DebugInfoSection({ scan, scanId, serverName, analysisResult }) {
  return (
    <details style={{ marginBottom: '16px' }}>
      <summary
        style={{
          cursor: 'pointer',
          padding: '8px 12px',
          background: colors.bgTertiary,
          borderRadius: '6px',
          fontSize: '11px',
          fontFamily: fonts.body,
          color: colors.textSecondary,
          border: `1px solid ${colors.borderLight}`,
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.bgSecondary;
          e.currentTarget.style.color = colors.textPrimary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = colors.bgTertiary;
          e.currentTarget.style.color = colors.textSecondary;
        }}
      >
        Debug Info (click to expand)
      </summary>
      <div
        style={{
          marginTop: '8px',
          padding: '12px',
          background: colors.bgTertiary,
          borderRadius: '6px',
          fontSize: '11px',
          fontFamily: 'monospace',
          border: `1px solid ${colors.borderLight}`,
        }}
      >
        <div style={{ fontSize: '10px', color: colors.textSecondary, lineHeight: '1.6' }}>
          <div>scanId: {scanId ? `"${scanId}"` : 'missing'}</div>
          <div>serverName: "{serverName}"</div>
          <div>analysisResult: {analysisResult ? 'found' : 'missing'}</div>
          <div>has scan.result: {scan.result ? 'yes' : 'no'}</div>
          <div>has scan.data: {scan.data ? 'yes' : 'no'}</div>
          <div>scan keys: {Object.keys(scan || {}).join(', ')}</div>
          {scan.result && <div>scan.result keys: {Object.keys(scan.result || {}).join(', ')}</div>}
          {scan.data && <div>scan.data keys: {Object.keys(scan.data || {}).join(', ')}</div>}
        </div>
      </div>
    </details>
  );
}
