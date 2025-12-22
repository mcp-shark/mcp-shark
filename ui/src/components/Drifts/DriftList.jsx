import { useEffect, useState } from 'react';
import { colors } from '../../theme';

export default function DriftList({ onSelectDrift, selectedDriftId }) {
  const [drifts, setDrifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDrifts();
  }, []);

  const loadDrifts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/drifts?limit=100');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to load drifts' }));
        throw new Error(errorData.error || errorData.message || 'Failed to load drifts');
      }
      const data = await res.json();
      setDrifts(data.drifts || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', color: colors.textSecondary }}>Loading drifts...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: colors.error }}>Error: {error}</div>;
  }

  if (drifts.length === 0) {
    return (
      <div style={{ padding: '20px', color: colors.textSecondary, textAlign: 'center' }}>
        No tool manifest drifts detected yet.
        <br />
        <small>Drifts are automatically tracked when tools/list responses change.</small>
      </div>
    );
  }

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
    <div style={{ overflow: 'auto', flex: 1 }}>
      {drifts.map((drift) => {
        const hasLlmAnalysis = !!drift.llm_analysis_json;
        const llmAnalysis = hasLlmAnalysis ? JSON.parse(drift.llm_analysis_json) : null;

        return (
          <button
            key={drift.drift_id}
            type="button"
            onClick={() => onSelectDrift(drift)}
            style={{
              width: '100%',
              padding: '16px',
              border: 'none',
              borderBottom: `1px solid ${colors.borderLight}`,
              cursor: 'pointer',
              background:
                selectedDriftId === drift.drift_id ? colors.bgSecondary : colors.bgPrimary,
              transition: 'background 0.2s',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              if (selectedDriftId !== drift.drift_id) {
                e.currentTarget.style.background = colors.bgSecondary;
              }
            }}
            onMouseLeave={(e) => {
              if (selectedDriftId !== drift.drift_id) {
                e.currentTarget.style.background = colors.bgPrimary;
              }
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
                >
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: getSeverityColor(drift.deterministic_severity),
                      color: '#fff',
                    }}
                  >
                    {drift.deterministic_severity?.toUpperCase() || 'UNKNOWN'}
                  </span>
                  {hasLlmAnalysis && (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: getSeverityColor(llmAnalysis?.riskLevel),
                        color: '#fff',
                      }}
                    >
                      LLM: {llmAnalysis?.riskLevel?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  )}
                  <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                    {drift.server_key}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: colors.textPrimary, marginBottom: '4px' }}>
                  {drift.diff_summary || 'No summary'}
                </div>
                {llmAnalysis?.summary && (
                  <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>
                    {llmAnalysis.summary}
                  </div>
                )}
                <div style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '8px' }}>
                  {new Date(Number(drift.created_at)).toLocaleString()}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
