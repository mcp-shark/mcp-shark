import { colors, fonts, withOpacity } from '../theme';

function BackupList({ backups, loadingBackups, onRefresh, onRestore, onView, onDelete }) {
  if (backups.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: `0 2px 4px ${colors.shadowSm}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h3
          style={{
            fontSize: '15px',
            fontWeight: '600',
            color: colors.textPrimary,
            fontFamily: fonts.body,
          }}
        >
          Backup Files
        </h3>
        <button
          onClick={onRefresh}
          disabled={loadingBackups}
          style={{
            padding: '4px 8px',
            background: 'transparent',
            border: `1px solid ${colors.borderMedium}`,
            color: colors.textSecondary,
            cursor: loadingBackups ? 'not-allowed' : 'pointer',
            fontSize: '11px',
            borderRadius: '8px',
            opacity: loadingBackups ? 0.5 : 1,
          }}
          title="Refresh backups"
        >
          {loadingBackups ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>
      <p
        style={{
          fontSize: '12px',
          color: colors.textSecondary,
          marginBottom: '12px',
          lineHeight: '1.4',
        }}
      >
        View, restore, or delete backups of your MCP configuration files. Backups are created
        automatically when starting MCP Shark.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {backups.map((backup, idx) => (
          <div
            key={idx}
            style={{
              padding: '12px',
              background: colors.bgPrimary,
              border: `1px solid ${colors.borderMedium}`,
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  color: colors.textPrimary,
                  fontSize: '12px',
                  fontWeight: '500',
                  marginBottom: '4px',
                }}
              >
                {backup.displayPath}
              </div>
              <div style={{ color: colors.textTertiary, fontSize: '11px', fontFamily: fonts.body }}>
                Created: {new Date(backup.modifiedAt || backup.createdAt).toLocaleString()} • Size:{' '}
                {(backup.size / 1024).toFixed(2)} KB
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => onView(backup.backupPath)}
                style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  border: `1px solid ${colors.borderMedium}`,
                  color: colors.textSecondary,
                  cursor: 'pointer',
                  fontSize: '12px',
                  borderRadius: '8px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.bgCard;
                  e.currentTarget.style.borderColor = colors.borderLight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = colors.borderMedium;
                }}
                title="View backup content"
              >
                View
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this backup?')) {
                    onDelete(backup.backupPath);
                  }
                }}
                style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  border: `1px solid ${colors.borderMedium}`,
                  color: colors.error,
                  cursor: 'pointer',
                  fontSize: '12px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontFamily: fonts.body,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = withOpacity(colors.error, 0.15);
                  e.currentTarget.style.borderColor = colors.error;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = colors.borderMedium;
                }}
                title="Delete backup"
              >
                Delete
              </button>
              <button
                onClick={() => onRestore(backup.backupPath, backup.originalPath)}
                style={{
                  padding: '6px 12px',
                  background: colors.buttonPrimary,
                  border: `1px solid ${colors.buttonPrimary}`,
                  color: colors.textInverse,
                  cursor: 'pointer',
                  fontSize: '12px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontFamily: fonts.body,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.buttonPrimaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.buttonPrimary;
                }}
                title="Restore this backup"
              >
                Restore
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BackupList;
