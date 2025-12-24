import { useEffect, useState } from 'react';
import { colors, fonts } from '../theme';

/**
 * Modal showing shutdown progress with countdown timer
 */
function ShuttingDownModal({ isOpen, initialSeconds = 3 }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

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
            fontSize: '48px',
            fontWeight: '700',
            color: colors.error,
            marginBottom: '16px',
          }}
        >
          {seconds}
        </div>
        <div
          style={{
            width: '100%',
            height: '4px',
            background: colors.bgTertiary,
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${((initialSeconds - seconds) / initialSeconds) * 100}%`,
              height: '100%',
              background: colors.error,
              transition: 'width 1s linear',
            }}
          />
        </div>
      </div>
    </dialog>
  );
}

export default ShuttingDownModal;
