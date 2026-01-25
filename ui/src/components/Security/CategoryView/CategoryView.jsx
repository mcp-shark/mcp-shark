import { colors, fonts } from '../../../theme.js';
import { CategorySection } from './CategorySection.jsx';
import { getCategory } from './constants.js';

function CategoryView({ findings, selectedFinding, onSelectFinding }) {
  const byCategory = findings.reduce((acc, finding) => {
    const cat = getCategory(finding);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(finding);
    return acc;
  }, {});

  const categoryOrder = ['owasp-mcp', 'agentic-security', 'general-security'];
  const sortedCategories = categoryOrder.filter((cat) => byCategory[cat]?.length > 0);

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
      {sortedCategories.map((cat) => (
        <CategorySection
          key={cat}
          category={cat}
          findings={byCategory[cat]}
          selectedFinding={selectedFinding}
          onSelectFinding={onSelectFinding}
        />
      ))}
    </div>
  );
}

export default CategoryView;
