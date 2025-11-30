import { colors, fonts } from '../../theme';

export default function ServerInfoSection({ serverData }) {
  if (!serverData) return null;

  return (
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
        Server Information
      </h3>
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
    </div>
  );
}
