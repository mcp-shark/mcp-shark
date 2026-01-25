import { useCallback } from 'react';
import { colors, fonts } from '../../../theme.js';
import { CategorySection } from './CategorySection.jsx';
import { CATEGORIES, getCategory } from './constants.js';

function CategoryView({ findings, selectedFinding, onSelectFinding }) {
  const byCategory = findings.reduce((acc, finding) => {
    const cat = getCategory(finding);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(finding);
    return acc;
  }, {});

  const categoryOrder = ['owasp-mcp', 'agentic-security', 'yara', 'general-security'];
  const sortedCategories = categoryOrder.filter((cat) => byCategory[cat]?.length > 0);

  const scrollToCategory = useCallback((catId) => {
    const element = document.getElementById(`category-${catId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  if (sortedCategories.length === 0) {
    return (
      <div
        style={{
          background: colors.bgCard,
          borderRadius: '8px',
          border: `1px solid ${colors.borderLight}`,
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '13px',
            color: colors.textSecondary,
            fontFamily: fonts.body,
            margin: 0,
          }}
        >
          No findings yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Quick Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        {sortedCategories.map((cat) => {
          const info = CATEGORIES[cat];
          const Icon = info.icon;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => scrollToCategory(cat)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: `${info.color}10`,
                border: `1px solid ${info.color}30`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: fonts.body,
                fontSize: '12px',
                color: info.color,
                fontWeight: 500,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${info.color}20`;
                e.currentTarget.style.borderColor = `${info.color}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${info.color}10`;
                e.currentTarget.style.borderColor = `${info.color}30`;
              }}
            >
              <Icon size={14} stroke={1.5} />
              {info.name}
              <span
                style={{
                  background: info.color,
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '10px',
                  fontWeight: 600,
                }}
              >
                {byCategory[cat].length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Sections */}
      {sortedCategories.map((cat) => (
        <div key={cat} id={`category-${cat}`}>
          <CategorySection
            category={cat}
            findings={byCategory[cat]}
            selectedFinding={selectedFinding}
            onSelectFinding={onSelectFinding}
          />
        </div>
      ))}
    </div>
  );
}

export default CategoryView;
