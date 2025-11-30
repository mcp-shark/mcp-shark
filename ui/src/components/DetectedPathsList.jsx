import { colors, fonts } from '../theme';
import { IconRefresh, IconEye, IconCode, IconClock } from '@tabler/icons-react';

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
          title="Refresh detection"
          style={{
            padding: '4px 8px',
            background: 'transparent',
            border: `1px solid ${colors.borderMedium}`,
            color: colors.textSecondary,
            cursor: detecting ? 'not-allowed' : 'pointer',
            fontSize: '11px',
            borderRadius: '8px',
            opacity: detecting ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {detecting ? (
            <>
              <IconRefresh
                size={12}
                stroke={1.5}
                style={{ animation: 'spin 1s linear infinite' }}
              />
              <span>Detecting...</span>
            </>
          ) : (
            <>
              <IconRefresh size={12} stroke={1.5} />
              <span>Refresh</span>
            </>
          )}
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
              borderRadius: '8px',
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
                  <IconCode size={14} stroke={1.5} />
                ) : (
                  <IconClock size={14} stroke={1.5} />
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
                      borderRadius: '6px',
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
                    title="View file content"
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      background: 'transparent',
                      border: `1px solid ${colors.borderMedium}`,
                      color: colors.textSecondary,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <IconEye size={10} stroke={1.5} />
                    <span>View</span>
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
