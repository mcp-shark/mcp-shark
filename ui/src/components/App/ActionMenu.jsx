import { IconMenu2, IconX } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { colors, fonts } from '../../theme';
import ApiDocsButton from './ApiDocsButton';
import HelpButton from './HelpButton';
import ShutdownButton from './ShutdownButton';

/**
 * Expandable action menu grouping API, Help, and Shutdown buttons
 */
export default function ActionMenu({ onHelpClick }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  const buttonStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: colors.bgCard,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    padding: 0,
    color: colors.textSecondary,
    cursor: 'pointer',
    fontFamily: fonts.body,
    boxShadow: `0 4px 12px ${colors.shadowMd}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    transition: 'all 0.2s ease',
  };

  const menuItemStyle = {
    position: 'absolute',
    right: '0',
    background: colors.bgCard,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    padding: 0,
    color: colors.textSecondary,
    cursor: 'pointer',
    fontFamily: fonts.body,
    boxShadow: `0 4px 12px ${colors.shadowMd}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: isExpanded ? 1 : 0,
    pointerEvents: isExpanded ? 'auto' : 'none',
    transform: isExpanded ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(10px)',
  };

  return (
    <div ref={menuRef} style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      {/* API Docs Button - Top */}
      <ApiDocsButton
        style={{
          ...menuItemStyle,
          bottom: isExpanded ? '180px' : '0',
          position: 'absolute',
          left: 'auto', // Ensure no left positioning conflicts
        }}
        onClick={() => setIsExpanded(false)}
        onMouseEnter={(e) => {
          if (isExpanded) {
            e.currentTarget.style.transform = 'scale(1.1) translateY(0)';
            e.currentTarget.style.boxShadow = `0 6px 16px ${colors.shadowLg}`;
          }
        }}
        onMouseLeave={(e) => {
          if (isExpanded) {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = `0 4px 12px ${colors.shadowMd}`;
          }
        }}
      />

      {/* Help Button - Middle */}
      <HelpButton
        onClick={() => {
          onHelpClick();
          setIsExpanded(false);
        }}
        style={{
          ...menuItemStyle,
          bottom: isExpanded ? '120px' : '0',
          position: 'absolute',
          left: 'auto', // Ensure no left positioning conflicts
        }}
        onMouseEnter={(e) => {
          if (isExpanded) {
            e.currentTarget.style.transform = 'scale(1.1) translateY(0)';
            e.currentTarget.style.boxShadow = `0 6px 16px ${colors.shadowLg}`;
          }
        }}
        onMouseLeave={(e) => {
          if (isExpanded) {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = `0 4px 12px ${colors.shadowMd}`;
          }
        }}
      />

      {/* Shutdown Button - Bottom (closest to main button) */}
      <ShutdownButton
        style={{
          ...menuItemStyle,
          bottom: isExpanded ? '60px' : '0',
          position: 'absolute',
          left: 'auto', // Override default left positioning
        }}
        onClick={() => setIsExpanded(false)}
        onMouseEnter={(e) => {
          if (isExpanded) {
            e.currentTarget.style.transform = 'scale(1.1) translateY(0)';
            e.currentTarget.style.boxShadow = `0 6px 16px ${colors.shadowLg}`;
          }
        }}
        onMouseLeave={(e) => {
          if (isExpanded) {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = `0 4px 12px ${colors.shadowMd}`;
          }
        }}
      />

      {/* Main Toggle Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          ...buttonStyle,
          background: isExpanded ? colors.accentBlue : colors.bgCard,
          color: isExpanded ? colors.textInverse : colors.textSecondary,
        }}
        onMouseEnter={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.background = colors.bgHover;
            e.currentTarget.style.color = colors.textPrimary;
            e.currentTarget.style.borderColor = colors.borderMedium;
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = `0 6px 16px ${colors.shadowLg}`;
          }
        }}
        onMouseLeave={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.background = colors.bgCard;
            e.currentTarget.style.color = colors.textSecondary;
            e.currentTarget.style.borderColor = colors.borderLight;
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = `0 4px 12px ${colors.shadowMd}`;
          }
        }}
        title={isExpanded ? 'Close menu' : 'Open menu'}
      >
        {isExpanded ? <IconX size={20} stroke={1.5} /> : <IconMenu2 size={20} stroke={1.5} />}
      </button>
    </div>
  );
}
