import { colors, fonts } from '../../theme';
import { ChevronDownIcon, MenuIcon } from '../TabNavigationIcons';

export default function MobileDropdown({
  tabs,
  activeTab,
  onTabChange,
  isDropdownOpen,
  setIsDropdownOpen,
  dropdownRef,
}) {
  return (
    <div
      style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'flex-end' }}
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: isDropdownOpen ? colors.bgSecondary : 'transparent',
          border: 'none',
          borderRadius: '8px',
          color: colors.textPrimary,
          cursor: 'pointer',
          fontSize: '14px',
          fontFamily: fonts.body,
          fontWeight: '500',
        }}
        onMouseEnter={(e) => {
          if (!isDropdownOpen) {
            e.currentTarget.style.background = colors.bgHover;
          }
        }}
        onMouseLeave={(e) => {
          if (!isDropdownOpen) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <MenuIcon size={18} color={colors.textPrimary} />
        <span>{tabs.find((t) => t.id === activeTab)?.label || 'Menu'}</span>
        <div
          style={{
            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronDownIcon size={14} color={colors.textPrimary} />
        </div>
      </button>
      {isDropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: colors.bgCard,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '8px',
            boxShadow: `0 4px 12px ${colors.shadowSm}`,
            minWidth: '280px',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setIsDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: activeTab === tab.id ? colors.bgSecondary : 'transparent',
                  border: 'none',
                  borderLeft:
                    activeTab === tab.id
                      ? `3px solid ${colors.accentBlue}`
                      : '3px solid transparent',
                  color: activeTab === tab.id ? colors.textPrimary : colors.textSecondary,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: fonts.body,
                  fontWeight: activeTab === tab.id ? '600' : '400',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '4px',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = colors.bgHover;
                    e.currentTarget.style.color = colors.textPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = colors.textSecondary;
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', color: 'currentColor' }}>
                    <Icon size={16} />
                  </div>
                  <span style={{ flex: 1 }}>{tab.label}</span>
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: activeTab === tab.id ? colors.textSecondary : colors.textTertiary,
                    fontWeight: '400',
                    fontFamily: fonts.body,
                    marginLeft: '26px',
                  }}
                >
                  {tab.description}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
