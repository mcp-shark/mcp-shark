import { useState, useRef } from 'react';
import { colors, fonts } from '../../theme';
import { CheckIcon, LoadingSpinner, CacheIcon } from '../SmartScanIcons';
import { ExternalLinkIcon } from '../SmartScanIcons';

export default function SmartScanControls({
  apiToken,
  setApiToken,
  saveToken,
  loadingData,
  discoverMcpData,
  discoveredServers,
  selectedServers,
  setSelectedServers,
  runScan,
  scanning,
}) {
  const saveTokenTimeoutRef = useRef(null);

  const handleTokenChange = (newToken) => {
    setApiToken(newToken);
    if (saveTokenTimeoutRef.current) {
      clearTimeout(saveTokenTimeoutRef.current);
    }
    if (newToken) {
      saveTokenTimeoutRef.current = setTimeout(() => {
        saveToken(newToken);
      }, 1000);
    } else {
      saveToken('');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
        flex: 1,
        justifyContent: 'flex-end',
      }}
    >
      {/* API Token Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <label
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: colors.textSecondary,
            fontFamily: fonts.body,
            whiteSpace: 'nowrap',
          }}
        >
          API Token:
        </label>
        <div style={{ position: 'relative', width: '200px' }}>
          <input
            type="password"
            value={apiToken}
            onChange={(e) => handleTokenChange(e.target.value)}
            placeholder="sk_..."
            style={{
              width: '100%',
              padding: '8px 10px',
              paddingRight: apiToken ? '28px' : '10px',
              border: `1px solid ${apiToken ? colors.accentGreen : colors.borderMedium}`,
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: fonts.body,
              background: colors.bgCard,
              color: colors.textPrimary,
              boxSizing: 'border-box',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.accentBlue;
              e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accentBlue}20`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = apiToken
                ? colors.accentGreen
                : colors.borderMedium;
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {apiToken && (
            <div
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <CheckIcon size={12} color={colors.accentGreen} />
            </div>
          )}
        </div>
        <a
          href="https://smart.mcpshark.sh/tokens"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: colors.accentBlue,
            textDecoration: 'none',
            fontFamily: fonts.body,
            fontWeight: '500',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          <span>Get token</span>
          <ExternalLinkIcon size={10} color={colors.accentBlue} />
        </a>
      </div>

      {/* Discover MCP Data Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <label
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: colors.textSecondary,
            fontFamily: fonts.body,
            whiteSpace: 'nowrap',
          }}
        >
          Servers:
        </label>
        <button
          onClick={discoverMcpData}
          disabled={loadingData}
          style={{
            padding: '8px 14px',
            background: !loadingData ? colors.buttonPrimary : colors.buttonSecondary,
            color: !loadingData ? colors.textInverse : colors.textTertiary,
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            fontFamily: fonts.body,
            cursor: !loadingData ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            if (!loadingData) {
              e.currentTarget.style.background = colors.buttonPrimaryHover;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loadingData) {
              e.currentTarget.style.background = colors.buttonPrimary;
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {loadingData ? (
            <>
              <LoadingSpinner size={12} />
              <span>Discovering...</span>
            </>
          ) : (
            <>
              <CheckIcon size={12} color={colors.textInverse} />
              <span>Discover</span>
            </>
          )}
        </button>
        {discoveredServers.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              background: colors.bgTertiary,
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '600',
              color: colors.textPrimary,
              fontFamily: fonts.body,
            }}
          >
            <CheckIcon size={12} color={colors.accentGreen} />
            <span>
              {discoveredServers.length} server{discoveredServers.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
