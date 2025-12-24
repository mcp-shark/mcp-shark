import { IconLoader2 } from '@tabler/icons-react';
import { colors, fonts } from '../theme';

/**
 * Modal showing shutdown progress with spinner
 */
function ShuttingDownModal({ isOpen }) {
  if (!isOpen) {
    return null;
  }

  return (
    <dialog
      open
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        border: 'none',
        margin: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <div
        role="document"
        style={{
          background: colors.bgCard,
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: `0 4px 20px ${colors.shadowLg}`,
          fontFamily: fonts.body,
          textAlign: 'center',
        }}
      >
        <h3
          style={{
            margin: '0 0 16px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: colors.textPrimary,
          }}
        >
          Shutting Down...
        </h3>
        <p
          style={{
            margin: '0 0 24px 0',
            fontSize: '14px',
            color: colors.textSecondary,
            lineHeight: '1.5',
          }}
        >
          MCP Shark is shutting down. The server will stop in a moment.
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <IconLoader2
            size={48}
            stroke={2}
            color={colors.error}
            style={{
              animation: 'shutdown-spin 1s linear infinite',
            }}
          />
        </div>
        <style>
          {`
            @keyframes shutdown-spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    </dialog>
  );
}

export default ShuttingDownModal;
