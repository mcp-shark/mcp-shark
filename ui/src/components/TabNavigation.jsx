import { useEffect, useRef } from 'react';
import { colors, fonts } from '../theme';
import anime from 'animejs';

function TabNavigation({ tabs, activeTab, onTabChange }) {
  const tabRefs = useRef({});
  const indicatorRef = useRef(null);

  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    if (activeTabElement && indicatorRef.current) {
      const { offsetLeft, offsetWidth } = activeTabElement;
      anime({
        targets: indicatorRef.current,
        left: offsetLeft,
        width: offsetWidth,
        duration: 300,
        easing: 'easeOutExpo',
      });
    }
  }, [activeTab, tabs]);

  return (
    <div
      style={{
        display: 'flex',
        borderBottom: `1px solid ${colors.borderLight}`,
        background: colors.bgCard,
        position: 'relative',
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          ref={(el) => (tabRefs.current[tab] = el)}
          onClick={() => onTabChange(tab)}
          style={{
            padding: '10px 18px',
            background: activeTab === tab ? colors.bgSecondary : 'transparent',
            border: 'none',
            borderBottom: '2px solid transparent',
            color: activeTab === tab ? colors.textPrimary : colors.textSecondary,
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: fonts.body,
            fontWeight: activeTab === tab ? '500' : '400',
            textTransform: 'capitalize',
            borderRadius: '6px 6px 0 0',
            transition: 'all 0.2s',
            position: 'relative',
            zIndex: 1,
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab) {
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
            if (activeTab !== tab) {
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
          {tab}
        </button>
      ))}
      <div
        ref={indicatorRef}
        style={{
          position: 'absolute',
          bottom: 0,
          height: '2px',
          background: colors.accentBlue,
          borderRadius: '2px 2px 0 0',
          zIndex: 2,
        }}
      />
    </div>
  );
}

export default TabNavigation;
