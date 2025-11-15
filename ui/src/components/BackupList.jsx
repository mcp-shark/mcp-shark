import { colors, fonts } from '../theme';

function BackupList({ backups, loadingBackups, onRefresh, onRestore, onView, onDelete }) {
  if (backups.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '6px',
        padding: '20px',
        marginBottom: '20px',
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
        <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#d4d4d4' }}>Backup Files</h3>
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
            borderRadius: '4px',
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
              borderRadius: '4px',
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
              <div style={{ color: '#858585', fontSize: '11px' }}>
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
                  borderRadius: '4px',
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
                  color: '#f48771',
                  cursor: 'pointer',
                  fontSize: '12px',
                  borderRadius: '4px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#3a1f1a';
                  e.currentTarget.style.borderColor = '#f48771';
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
                  background: '#0e639c',
                  border: '1px solid #0e639c',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  borderRadius: '4px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1177bb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#0e639c';
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
