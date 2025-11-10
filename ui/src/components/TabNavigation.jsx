import { colors, fonts } from '../theme';

function TabNavigation({ tabs, activeTab, onTabChange }) {
  return (
    <div
      style={{
        display: 'flex',
        borderBottom: `1px solid ${colors.borderLight}`,
        background: colors.bgCard,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          style={{
            padding: '10px 18px',
            background: activeTab === tab ? colors.bgSecondary : 'transparent',
            border: 'none',
            borderBottom:
              activeTab === tab ? `2px solid ${colors.accentBlue}` : '2px solid transparent',
            color: activeTab === tab ? colors.textPrimary : colors.textSecondary,
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: fonts.body,
            fontWeight: activeTab === tab ? '500' : '400',
            textTransform: 'capitalize',
            borderRadius: '6px 6px 0 0',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab) {
              e.currentTarget.style.background = colors.bgHover;
              e.currentTarget.style.color = colors.textPrimary;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.textSecondary;
            }
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default TabNavigation;
