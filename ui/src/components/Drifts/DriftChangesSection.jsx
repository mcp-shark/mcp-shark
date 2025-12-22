import { colors } from '../../theme';
import CollapsibleSection from '../CollapsibleSection';

export default function DriftChangesSection({ diff }) {
  if (!diff) {
    return null;
  }

  return (
    <CollapsibleSection title="Changes" titleColor={colors.accentBlue} defaultExpanded={true}>
      {diff.added && diff.added.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: '#22c55e', marginBottom: '8px' }}>
            Added Tools ({diff.added.length})
          </h4>
          {diff.added.map((tool, idx) => (
            <div
              key={idx}
              style={{
                padding: '8px',
                background: colors.bgSecondary,
                borderRadius: '4px',
                marginBottom: '4px',
                fontSize: '13px',
              }}
            >
              <strong>{tool.name}</strong>
              {tool.description && (
                <div style={{ color: colors.textSecondary, marginTop: '4px' }}>
                  {tool.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {diff.removed && diff.removed.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: '#ef4444', marginBottom: '8px' }}>
            Removed Tools ({diff.removed.length})
          </h4>
          {diff.removed.map((tool, idx) => (
            <div
              key={idx}
              style={{
                padding: '8px',
                background: colors.bgSecondary,
                borderRadius: '4px',
                marginBottom: '4px',
                fontSize: '13px',
              }}
            >
              <strong>{tool.name}</strong>
              {tool.description && (
                <div style={{ color: colors.textSecondary, marginTop: '4px' }}>
                  {tool.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {diff.changed && diff.changed.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: '#eab308', marginBottom: '8px' }}>
            Changed Tools ({diff.changed.length})
          </h4>
          {diff.changed.map((tool, idx) => (
            <div
              key={idx}
              style={{
                padding: '8px',
                background: colors.bgSecondary,
                borderRadius: '4px',
                marginBottom: '4px',
                fontSize: '13px',
              }}
            >
              <strong>{tool.name}</strong>
              <div style={{ color: colors.textSecondary, marginTop: '4px' }}>
                Changes: {tool.changes?.join(', ') || 'Unknown'}
              </div>
            </div>
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
}
