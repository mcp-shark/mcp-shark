import { colors } from '../../theme';
import CollapsibleSection from '../CollapsibleSection';

export default function DriftMetadataSection({ drift }) {
  return (
    <CollapsibleSection title="Metadata" titleColor={colors.textSecondary} defaultExpanded={false}>
      <div style={{ fontSize: '12px', color: colors.textSecondary, lineHeight: '1.8' }}>
        <div>
          <strong>Drift ID:</strong> {drift.drift_id}
        </div>
        <div>
          <strong>From Hash:</strong> {drift.from_hash?.slice(0, 16)}...
        </div>
        <div>
          <strong>To Hash:</strong> {drift.to_hash?.slice(0, 16)}...
        </div>
        {drift.llm_provider && (
          <div>
            <strong>LLM Provider:</strong> {drift.llm_provider}
          </div>
        )}
        {drift.llm_model && (
          <div>
            <strong>LLM Model:</strong> {drift.llm_model}
          </div>
        )}
        {drift.llm_prompt_version && (
          <div>
            <strong>Prompt Version:</strong> {drift.llm_prompt_version}
          </div>
        )}
        {drift.llm_analyzed_at && (
          <div>
            <strong>Analyzed At:</strong> {new Date(Number(drift.llm_analyzed_at)).toLocaleString()}
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
