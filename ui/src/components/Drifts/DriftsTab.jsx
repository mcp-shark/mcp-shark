import { useState } from 'react';
import { colors } from '../../theme';
import DriftDetail from './DriftDetail';
import DriftList from './DriftList';

export default function DriftsTab() {
  const [selectedDrift, setSelectedDrift] = useState(null);

  return (
    <div data-tab-content style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
        <div
          style={{
            padding: '16px',
            borderBottom: `1px solid ${colors.borderLight}`,
            background: colors.bgCard,
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', color: colors.textPrimary }}>
            Tool Manifest Drifts
          </h2>
          <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>
            Track changes in MCP tool manifests with LLM-powered security analysis
          </div>
        </div>
        <DriftList onSelectDrift={setSelectedDrift} selectedDriftId={selectedDrift?.drift_id} />
      </div>
      {selectedDrift && (
        <div
          style={{
            width: '50%',
            minWidth: '500px',
            maxWidth: '800px',
            borderLeft: `1px solid ${colors.borderLight}`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: colors.bgCard,
            flexShrink: 0,
          }}
        >
          <DriftDetail drift={selectedDrift} onClose={() => setSelectedDrift(null)} />
        </div>
      )}
    </div>
  );
}
