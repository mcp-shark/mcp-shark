import { colors, fonts } from '../theme';

function DetectedPathsList({ detectedPaths, detecting, onDetect, onSelect, onView }) {
  if (detectedPaths.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '8px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            fontSize: '13px',
            color: colors.textPrimary,
            fontWeight: '600',
            fontFamily: fonts.body,
          }}
        >
          Detected Configuration Files:
        </div>
        <button
          onClick={onDetect}
          disabled={detecting}
          style={{
            padding: '4px 8px',
            background: 'transparent',
            border: `1px solid ${colors.borderMedium}`,
            color: colors.textSecondary,
            cursor: detecting ? 'not-allowed' : 'pointer',
            fontSize: '11px',
            borderRadius: '4px',
            opacity: detecting ? 0.5 : 1,
          }}
          title="Refresh detection"
        >
          {detecting ? 'Detecting...' : '🔄 Refresh'}
        </button>
      </div>
      <div
        data-tour="detected-editors"
        style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
      >
        {detectedPaths.map((item, idx) => (
          <button
            key={idx}
            data-tour={idx === 0 ? 'first-detected-editor' : undefined}
            onClick={() => onSelect(item.path)}
            onDoubleClick={() => {
              if (item.exists) {
                onView(item.path);
              }
            }}
            style={{
              padding: '8px 12px',
              background: item.exists ? `${colors.accentBlue}20` : colors.bgSecondary,
              border: `1px solid ${item.exists ? colors.accentBlue : colors.borderMedium}`,
              color: colors.textPrimary,
              cursor: 'pointer',
              fontSize: '12px',
              borderRadius: '4px',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = item.exists
                ? `${colors.accentBlue}30`
                : colors.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = item.exists
                ? `${colors.accentBlue}20`
                : colors.bgSecondary;
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                {item.editor === 'Cursor' ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                )}
              </span>
              <div>
                <div style={{ fontWeight: '500' }}>{item.editor}</div>
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.textSecondary,
                    fontFamily: fonts.body,
                  }}
                >
                  {item.displayPath}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {item.exists && (
                <>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      background: colors.success,
                      color: colors.textInverse,
                      borderRadius: '3px',
                      fontWeight: '500',
                    }}
                  >
                    Found
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(item.path);
                    }}
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      background: 'transparent',
                      border: `1px solid ${colors.borderMedium}`,
                      color: colors.textSecondary,
                      borderRadius: '3px',
                      cursor: 'pointer',
                    }}
                    title="View file content"
                  >
                    👁️ View
                  </button>
                </>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DetectedPathsList;
