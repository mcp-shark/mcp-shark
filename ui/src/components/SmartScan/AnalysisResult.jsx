import { colors, fonts } from '../../theme';
import ExpandableSection from './ExpandableSection';
import FindingsTable from './FindingsTable';
import NotablePatternsSection from './NotablePatternsSection';
import OverallSummarySection from './OverallSummarySection';
import RecommendationsSection from './RecommendationsSection';

export default function AnalysisResult({ analysis }) {
  if (!analysis) {
    return (
      <div
        style={{
          padding: '12px',
          background: `${colors.bgTertiary}80`,
          borderRadius: '6px',
          border: `1px solid ${colors.borderLight}`,
          fontSize: '12px',
          color: colors.textSecondary,
          fontFamily: fonts.body,
        }}
      >
        No analysis data available.
      </div>
    );
  }

  const toolFindings = analysis.tool_findings || [];
  const promptFindings = analysis.prompt_findings || [];
  const resourceFindings = analysis.resource_findings || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <OverallSummarySection
        overallRiskLevel={analysis.overall_risk_level}
        overallReason={analysis.overall_reason}
      />
      {toolFindings.length > 0 && (
        <ExpandableSection title="Tool Findings" count={toolFindings.length} defaultExpanded={true}>
          <FindingsTable findings={toolFindings} type="tool" />
        </ExpandableSection>
      )}
      {promptFindings.length > 0 && (
        <ExpandableSection
          title="Prompt Findings"
          count={promptFindings.length}
          defaultExpanded={true}
        >
          <FindingsTable findings={promptFindings} type="prompt" />
        </ExpandableSection>
      )}
      {resourceFindings.length > 0 && (
        <ExpandableSection
          title="Resource Findings"
          count={resourceFindings.length}
          defaultExpanded={true}
        >
          <FindingsTable findings={resourceFindings} type="resource" />
        </ExpandableSection>
      )}
      <RecommendationsSection recommendations={analysis.recommendations} />
      <NotablePatternsSection patterns={analysis.notable_patterns} />
    </div>
  );
}
