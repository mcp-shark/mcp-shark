import { useEffect, useState } from 'react';
import { colors } from '../../theme';
import CollapsibleSection from '../CollapsibleSection';
import DriftChangesSection from './DriftChangesSection.jsx';
import DriftDetailHeader from './DriftDetailHeader.jsx';
import DriftLlmFindingsSection from './DriftLlmFindingsSection.jsx';
import DriftMetadataSection from './DriftMetadataSection.jsx';
import DriftSummarySection from './DriftSummarySection.jsx';

export default function DriftDetail({ drift, onClose }) {
  const [_loading, setLoading] = useState(false);
  const [fullDrift, setFullDrift] = useState(drift);

  useEffect(() => {
    if (drift?.drift_id && !fullDrift?.from_manifest_json) {
      loadFullDrift();
    }
  }, [drift?.drift_id]);

  const loadFullDrift = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/drifts/${drift.drift_id}`);
      if (!res.ok) {
        throw new Error('Failed to load drift details');
      }
      const data = await res.json();
      setFullDrift(data);
    } catch (_err) {
      // Error handling - in production, use proper error tracking
    } finally {
      setLoading(false);
    }
  };

  if (!drift) {
    return null;
  }

  const diff = drift.diff_json ? JSON.parse(drift.diff_json) : null;
  const llmAnalysis = drift.llm_analysis_json ? JSON.parse(drift.llm_analysis_json) : null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#eab308';
      case 'low':
        return '#22c55e';
      default:
        return colors.textSecondary;
    }
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: colors.bgPrimary,
      }}
    >
      <DriftDetailHeader drift={drift} onClose={onClose} />

      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <DriftSummarySection
            drift={drift}
            llmAnalysis={llmAnalysis}
            getSeverityColor={getSeverityColor}
          />
          <DriftChangesSection diff={diff} />
          <DriftLlmFindingsSection llmAnalysis={llmAnalysis} getSeverityColor={getSeverityColor} />

          {drift.llm_analysis_error && (
            <CollapsibleSection
              title="LLM Analysis Error"
              titleColor="#ef4444"
              defaultExpanded={false}
            >
              <div
                style={{
                  padding: '12px',
                  background: colors.bgSecondary,
                  borderRadius: '6px',
                  color: '#ef4444',
                }}
              >
                {drift.llm_analysis_error}
              </div>
            </CollapsibleSection>
          )}

          <DriftMetadataSection drift={drift} />
        </div>
      </div>
    </div>
  );
}
