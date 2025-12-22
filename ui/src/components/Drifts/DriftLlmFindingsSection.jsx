import { colors } from '../../theme';
import CollapsibleSection from '../CollapsibleSection';

export default function DriftLlmFindingsSection({ llmAnalysis, getSeverityColor }) {
  if (!llmAnalysis?.findings || llmAnalysis.findings.length === 0) {
    return null;
  }

  return (
    <CollapsibleSection
      title="LLM Security Findings"
      titleColor={colors.accentBlue}
      defaultExpanded={true}
    >
      {llmAnalysis.findings.map((finding, idx) => (
        <div
          key={idx}
          style={{
            padding: '12px',
            background: colors.bgSecondary,
            borderRadius: '6px',
            marginBottom: '12px',
            borderLeft: `4px solid ${getSeverityColor(finding.severity)}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px',
            }}
          >
            <div>
              <strong style={{ color: colors.textPrimary }}>{finding.toolName}</strong>
              <span
                style={{
                  marginLeft: '8px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  background: getSeverityColor(finding.severity),
                  color: '#fff',
                }}
              >
                {finding.severity?.toUpperCase()}
              </span>
              <span
                style={{
                  marginLeft: '8px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  background: colors.bgPrimary,
                  color: colors.textSecondary,
                }}
              >
                {finding.type}
              </span>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: colors.textPrimary, marginBottom: '4px' }}>
            {finding.description}
          </div>
          {finding.recommendation && (
            <div
              style={{
                fontSize: '12px',
                color: colors.textSecondary,
                marginTop: '8px',
                fontStyle: 'italic',
              }}
            >
              💡 {finding.recommendation}
            </div>
          )}
        </div>
      ))}
    </CollapsibleSection>
  );
}
