import { colors, fonts } from '../theme';

function ConfigViewerModal({
  viewingConfig,
  configContent,
  loadingConfig,
  onClose,
  viewingBackup,
  backupContent,
  loadingBackup,
}) {
  const isViewingBackup = viewingBackup !== null;
  const isViewingConfig = viewingConfig !== null;

  if (!isViewingConfig && !isViewingBackup) {
    return null;
  }

  const content = isViewingBackup ? backupContent : configContent;
  const loading = isViewingBackup ? loadingBackup : loadingConfig;
  const title = isViewingBackup ? 'Backup File' : 'MCP Configuration File';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.bgPrimary,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '8px',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '4px',
                color: colors.textPrimary,
              }}
            >
              {title}
            </h3>
            {content && (
              <div style={{ fontSize: '12px', color: '#858585' }}>
                {content.displayPath}
                {isViewingBackup && content.createdAt && (
                  <span style={{ marginLeft: '12px', color: '#666' }}>
                    Created: {new Date(content.createdAt).toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.textPrimary,
              cursor: 'pointer',
              fontSize: '24px',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px',
          }}
        >
          {loading ? (
            <div style={{ color: '#858585', textAlign: 'center', padding: '40px' }}>Loading...</div>
          ) : content ? (
            <pre
              style={{
                background: colors.bgPrimary,
                padding: '16px',
                borderRadius: '4px',
                fontSize: '13px',
                fontFamily: 'monospace',
                color: colors.textPrimary,
                overflow: 'auto',
                border: `1px solid ${colors.borderLight}`,
                lineHeight: '1.6',
                margin: 0,
              }}
            >
              {content.content}
            </pre>
          ) : (
            <div style={{ color: '#f48771', textAlign: 'center', padding: '40px' }}>
              Failed to load file content
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfigViewerModal;
