import { useEffect, useState } from 'react';
import { colors, fonts } from './theme';

/**
 * Shutdown page - shows message and redirects to root after 3 seconds
 */
function ShutdownPage() {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: colors.bgPrimary,
        fontFamily: fonts.body,
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '500px',
          width: '100%',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: '600',
            color: colors.textPrimary,
            margin: '0 0 16px 0',
          }}
        >
          MCP Shark Shutdown
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: colors.textSecondary,
            margin: '0 0 32px 0',
            lineHeight: '1.6',
          }}
        >
          MCP Shark has been shut down.
        </p>
        <div
          style={{
            padding: '24px',
            background: colors.bgCard,
            borderRadius: '12px',
            border: `1px solid ${colors.borderLight}`,
            boxShadow: `0 4px 12px ${colors.shadowMd}`,
          }}
        >
          <p
            style={{
              fontSize: '14px',
              color: colors.textSecondary,
              margin: '0 0 16px 0',
              lineHeight: '1.6',
            }}
          >
            The MCP Shark server has been stopped. Redirecting in {countdown} second
            {countdown !== 1 ? 's' : ''}...
          </p>
        </div>
      </div>
    </div>
  );
}

export default ShutdownPage;
