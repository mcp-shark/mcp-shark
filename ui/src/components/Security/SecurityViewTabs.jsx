import { colors, fonts } from '../../theme';

export default function SecurityViewTabs({ activeTab, setActiveTab }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '8px',
        padding: '4px',
        background: colors.bgSecondary,
      }}
    >
      <button
        type="button"
        onClick={() => setActiveTab('scanner')}
        style={{
          padding: '6px 14px',
          background: activeTab === 'scanner' ? colors.bgCard : 'transparent',
          border: 'none',
          color: activeTab === 'scanner' ? colors.textPrimary : colors.textSecondary,
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: fonts.body,
          fontWeight: activeTab === 'scanner' ? '600' : '400',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        OWASP Local Static Analysis
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('rules')}
        style={{
          padding: '6px 14px',
          background: activeTab === 'rules' ? colors.bgCard : 'transparent',
          border: 'none',
          color: activeTab === 'rules' ? colors.textPrimary : colors.textSecondary,
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: fonts.body,
          fontWeight: activeTab === 'rules' ? '600' : '400',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        YARA Detection
      </button>
    </div>
  );
}
