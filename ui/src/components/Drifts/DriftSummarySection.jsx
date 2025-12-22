import { colors } from '../../theme';
import CollapsibleSection from '../CollapsibleSection';

export default function DriftSummarySection({ drift, llmAnalysis, getSeverityColor }) {
  return (
    <CollapsibleSection title="Summary" titleColor={colors.accentBlue} defaultExpanded={true}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            background: getSeverityColor(drift.deterministic_severity),
            color: '#fff',
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          Deterministic: {drift.deterministic_severity?.toUpperCase() || 'UNKNOWN'}
        </div>
        {llmAnalysis && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: getSeverityColor(llmAnalysis.riskLevel),
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            LLM Risk: {llmAnalysis.riskLevel?.toUpperCase() || 'UNKNOWN'}
          </div>
        )}
        {llmAnalysis?.confidence && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: colors.bgSecondary,
              color: colors.textPrimary,
              fontSize: '13px',
            }}
          >
            Confidence: {Math.round(llmAnalysis.confidence * 100)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: '14px', color: colors.textPrimary, lineHeight: '1.6' }}>
        {drift.diff_summary || 'No summary available'}
      </div>
      {llmAnalysis?.summary && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            background: colors.bgSecondary,
            borderRadius: '6px',
            fontSize: '13px',
            color: colors.textPrimary,
            lineHeight: '1.6',
          }}
        >
          <strong>LLM Analysis:</strong> {llmAnalysis.summary}
        </div>
      )}
    </CollapsibleSection>
  );
}
