import { SankeyChart } from './SankeyChart.jsx';
import { SeverityDistributionChart } from './SeverityDistributionChart.jsx';
import { TopVulnerabilityTypesChart } from './TopVulnerabilityTypesChart.jsx';

function SecurityCharts({ findings }) {
  if (!findings || findings.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '16px',
      }}
    >
      <SeverityDistributionChart findings={findings} />
      <TopVulnerabilityTypesChart findings={findings} />
      <div style={{ gridColumn: 'span 2' }}>
        <SankeyChart findings={findings} />
      </div>
    </div>
  );
}

export default SecurityCharts;
