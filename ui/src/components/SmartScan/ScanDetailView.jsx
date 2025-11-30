import { colors, fonts } from '../../theme';
import { IconX, IconExternalLink } from '@tabler/icons-react';
import { getRiskLevelColor } from './utils';
import AnalysisResult from './AnalysisResult';

export default function ScanDetailView({ scan, loading, onClose }) {
  if (loading) {
    return (
      <div
        style={{
          background: colors.bgCard,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <p style={{ color: colors.textSecondary, fontFamily: fonts.body }}>
          Loading scan details...
        </p>
      </div>
    );
  }

  if (!scan) {
    return (
      <div
        style={{
          background: colors.bgCard,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <p style={{ color: colors.textSecondary, fontFamily: fonts.body }}>
          No scan data available
        </p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Normalize scan data structure - handle different formats
  const getScanValue = (path) => {
    const paths = path.split('.');
    let value = scan;
    for (const p of paths) {
      if (value && typeof value === 'object') {
        value = value[p];
      } else {
        return null;
      }
    }
    return value;
  };

  // Get normalized values - handle nested structures from API
  // API response can be:
  // - { result: { id, analysis_result, mcp_server_data, ... } } (from getScan API)
  // - { scan_id, data: { id, analysis_result, ... } } (from batch scans)
  // - Direct scan object

  // First, check if we have a 'result' wrapper (from getScan API)
  const actualScan = scan.result || scan.data || scan;

  const scanId =
    getScanValue('result.id') ||
    getScanValue('id') ||
    getScanValue('scan_id') ||
    getScanValue('data.id') ||
    getScanValue('data.scan_id') ||
    (actualScan && actualScan.id) ||
    (actualScan && actualScan.scan_id);

  const serverName =
    getScanValue('result.mcp_server_data.server.name') ||
    getScanValue('mcp_server_data.server.name') ||
    getScanValue('server.name') ||
    getScanValue('data.server.name') ||
    getScanValue('data.data.server.name') ||
    'Unknown Server';

  const status =
    getScanValue('result.status') || getScanValue('status') || getScanValue('data.status');

  const overallRiskLevel =
    getScanValue('result.overall_risk_level') ||
    getScanValue('overall_risk_level') ||
    getScanValue('data.overall_risk_level') ||
    getScanValue('data.data.overall_risk_level');

  const createdAt =
    getScanValue('result.created_at') ||
    getScanValue('created_at') ||
    getScanValue('data.created_at') ||
    getScanValue('data.data.created_at');

  const updatedAt =
    getScanValue('result.updated_at') ||
    getScanValue('updated_at') ||
    getScanValue('data.updated_at') ||
    getScanValue('data.data.updated_at');

  // Try multiple paths for analysis_result - this is the key data
  let analysisResult =
    getScanValue('result.analysis_result') ||
    getScanValue('analysis_result') ||
    getScanValue('data.analysis_result') ||
    getScanValue('data.data.analysis_result') ||
    getScanValue('data.data.data.analysis_result');

  // If still not found, check if scan itself is the analysis result
  if (!analysisResult && actualScan && typeof actualScan === 'object') {
    // Check if actualScan has analysis_result properties directly
    if (actualScan.tool_findings || actualScan.prompt_findings || actualScan.resource_findings) {
      analysisResult = actualScan;
    }
    // Also check for analysis_result property
    if (!analysisResult && actualScan.analysis_result) {
      analysisResult = actualScan.analysis_result;
    }
  }

  const serverData =
    getScanValue('result.mcp_server_data.server') ||
    getScanValue('mcp_server_data.server') ||
    getScanValue('server') ||
    getScanValue('data.server') ||
    getScanValue('data.data.server') ||
    getScanValue('mcp_server_data');

  const renderSection = (title, content) => (
    <div style={{ marginBottom: '24px' }}>
      <h3
        style={{
          fontSize: '13px',
          fontWeight: '600',
          color: colors.textPrimary,
          fontFamily: fonts.body,
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: `1px solid ${colors.borderLight}`,
        }}
      >
        {title}
      </h3>
      {content}
    </div>
  );

  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '8px',
        padding: '24px',
        boxShadow: `0 1px 3px ${colors.shadowSm}`,
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.textPrimary,
              fontFamily: fonts.body,
              margin: 0,
              marginBottom: '8px',
            }}
          >
            {serverName}
          </h2>
          {scanId && (
            <div
              style={{
                fontSize: '12px',
                color: colors.textTertiary,
                fontFamily: fonts.body,
              }}
            >
              ID: {scanId}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {scanId && (
            <a
              href={`https://smart.mcpshark.sh/scan-results?id=${scanId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '6px 12px',
                background: colors.buttonPrimary,
                border: 'none',
                color: colors.textInverse,
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: fonts.body,
                fontWeight: '500',
                textDecoration: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <IconExternalLink size={14} stroke={1.5} />
              View on Smart Scan
            </a>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              background: 'transparent',
              border: 'none',
              color: colors.textSecondary,
              cursor: 'pointer',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.bgTertiary;
              e.currentTarget.style.color = colors.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.textSecondary;
            }}
          >
            <IconX size={20} stroke={1.5} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Debug Info - Collapsible, closed by default */}
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
              {scan.result && (
                <div>scan.result keys: {Object.keys(scan.result || {}).join(', ')}</div>
              )}
              {scan.data && <div>scan.data keys: {Object.keys(scan.data || {}).join(', ')}</div>}
            </div>
          </div>
        </details>

        {/* Overview */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            padding: '16px',
            background: colors.bgTertiary,
            borderRadius: '8px',
          }}
        >
          {status && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  color: colors.textTertiary,
                  fontFamily: fonts.body,
                  marginBottom: '4px',
                }}
              >
                Status
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: colors.textPrimary,
                  fontFamily: fonts.body,
                  fontWeight: '500',
                }}
              >
                {status}
              </div>
            </div>
          )}
          {overallRiskLevel && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  color: colors.textTertiary,
                  fontFamily: fonts.body,
                  marginBottom: '4px',
                }}
              >
                Overall Risk Level
              </div>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  fontFamily: fonts.body,
                  background: getRiskLevelColor(overallRiskLevel),
                  color: colors.textInverse,
                  display: 'inline-block',
                }}
              >
                {overallRiskLevel.toLowerCase()}
              </span>
            </div>
          )}
          {createdAt && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  color: colors.textTertiary,
                  fontFamily: fonts.body,
                  marginBottom: '4px',
                }}
              >
                Created At
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: colors.textPrimary,
                  fontFamily: fonts.body,
                  fontWeight: '500',
                }}
              >
                {formatDate(createdAt)}
              </div>
            </div>
          )}
          {updatedAt && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  color: colors.textTertiary,
                  fontFamily: fonts.body,
                  marginBottom: '4px',
                }}
              >
                Updated At
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: colors.textPrimary,
                  fontFamily: fonts.body,
                  fontWeight: '500',
                }}
              >
                {formatDate(updatedAt)}
              </div>
            </div>
          )}
        </div>

        {/* Server Information */}
        {serverData &&
          renderSection(
            'Server Information',
            <div
              style={{
                padding: '12px',
                background: colors.bgTertiary,
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: fonts.body,
              }}
            >
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: colors.textTertiary }}>Name: </strong>
                <span style={{ color: colors.textPrimary }}>{serverData.name || 'N/A'}</span>
              </div>
              {serverData.description && (
                <div>
                  <strong style={{ color: colors.textTertiary }}>Description: </strong>
                  <span style={{ color: colors.textPrimary }}>{serverData.description}</span>
                </div>
              )}
            </div>
          )}

        {/* Analysis Result */}
        {analysisResult ? (
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: colors.textPrimary,
                fontFamily: fonts.body,
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: `1px solid ${colors.borderLight}`,
              }}
            >
              Analysis Result
            </h3>
            <AnalysisResult analysis={analysisResult} />
          </div>
        ) : (
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: colors.textPrimary,
                fontFamily: fonts.body,
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: `1px solid ${colors.borderLight}`,
              }}
            >
              Analysis Result
            </h3>
            <div
              style={{
                padding: '12px',
                background: colors.bgTertiary + '80',
                borderRadius: '6px',
                border: `1px solid ${colors.borderLight}`,
                fontSize: '12px',
                color: colors.textSecondary,
                fontFamily: fonts.body,
              }}
            >
              No analysis result available for this scan. Check the Raw Data section below to see
              the scan structure.
            </div>
          </div>
        )}

        {/* Raw Data - Collapsible */}
        {renderSection(
          'Raw Data',
          <details>
            <summary
              style={{
                cursor: 'pointer',
                padding: '8px',
                background: colors.bgTertiary,
                borderRadius: '4px',
                fontSize: '11px',
                color: colors.textSecondary,
                fontFamily: fonts.body,
                marginBottom: '8px',
              }}
            >
              Click to view raw JSON data
            </summary>
            <pre
              style={{
                padding: '12px',
                background: colors.bgTertiary,
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: colors.textPrimary,
                overflow: 'auto',
                maxHeight: '400px',
                margin: 0,
              }}
            >
              {JSON.stringify(scan, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
