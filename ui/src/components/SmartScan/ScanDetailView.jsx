import { colors, fonts } from '../../theme';
import AnalysisResult from './AnalysisResult';
import DebugInfoSection from './DebugInfoSection';
import RawDataSection from './RawDataSection';
import ScanDetailHeader from './ScanDetailHeader';
import ScanOverviewSection from './ScanOverviewSection';
import ServerInfoSection from './ServerInfoSection';
import { normalizeScanData } from './scanDataUtils';

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

  const {
    scanId,
    serverName,
    status,
    overallRiskLevel,
    createdAt,
    updatedAt,
    analysisResult,
    serverData,
  } = normalizeScanData(scan);

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
      <ScanDetailHeader scanId={scanId} serverName={serverName} onClose={onClose} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <DebugInfoSection
          scan={scan}
          scanId={scanId}
          serverName={serverName}
          analysisResult={analysisResult}
        />

        <ScanOverviewSection
          status={status}
          overallRiskLevel={overallRiskLevel}
          createdAt={createdAt}
          updatedAt={updatedAt}
        />

        <ServerInfoSection serverData={serverData} />

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
                background: `${colors.bgTertiary}80`,
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

        <RawDataSection scan={scan} />
      </div>
    </div>
  );
}
