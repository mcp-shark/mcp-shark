import { useEffect, useRef } from 'react';
import { colors, fonts } from '../../theme';
import anime from 'animejs';

export default function DesktopTabs({ tabs, activeTab, onTabChange, tabRefs, indicatorRef }) {
  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    if (activeTabElement && indicatorRef.current) {
      const { offsetLeft, offsetWidth } = activeTabElement;
      anime({
        targets: indicatorRef.current,
        left: offsetLeft,
        width: offsetWidth,
        duration: 400,
        easing: 'easeOutExpo',
      });
    }
  }, [activeTab, tabRefs, indicatorRef]);

  return (
    <div style={{ position: 'relative', display: 'flex', flex: 1 }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => (tabRefs.current[tab.id] = el)}
          data-tour={
            tab.id === 'traffic'
              ? 'traffic-tab'
              : tab.id === 'logs'
                ? 'logs-tab'
                : tab.id === 'setup'
                  ? 'setup-tab'
                  : tab.id === 'playground'
                    ? 'playground-tab'
                    : 'smart-scan-tab'
          }
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: '14px 24px',
            background: activeTab === tab.id ? colors.bgSecondary : 'transparent',
            border: 'none',
            borderBottom: '3px solid transparent',
            color: activeTab === tab.id ? colors.textPrimary : colors.textSecondary,
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: fonts.body,
            fontWeight: activeTab === tab.id ? '600' : '400',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '4px',
            position: 'relative',
            borderRadius: '8px 8px 0 0',
            zIndex: 1,
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              anime({
                targets: e.currentTarget,
                background: colors.bgHover,
                color: colors.textPrimary,
                duration: 200,
                easing: 'easeOutQuad',
              });
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              anime({
                targets: e.currentTarget,
                background: 'transparent',
                color: colors.textSecondary,
                duration: 200,
                easing: 'easeOutQuad',
              });
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', color: 'currentColor' }}>
              <tab.icon size={16} />
            </div>
            <span>{tab.label}</span>
          </div>
          <div
            style={{
              fontSize: '11px',
              color: activeTab === tab.id ? colors.textSecondary : colors.textTertiary,
              fontWeight: '400',
              fontFamily: fonts.body,
            }}
          >
            {tab.description}
          </div>
        </button>
      ))}
      <div
        ref={indicatorRef}
        style={{
          position: 'absolute',
          bottom: 0,
          height: '3px',
          background: colors.accentBlue,
          borderRadius: '3px 3px 0 0',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
