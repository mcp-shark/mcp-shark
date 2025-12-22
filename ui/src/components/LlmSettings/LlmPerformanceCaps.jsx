import CollapsibleSection from '../CollapsibleSection';
import { LabeledRow, TextInput } from './LlmSettingsUi.jsx';

function parseIntegerOrNull(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseIntegerOrFallback(value, fallback) {
  const parsed = Number.parseInt(String(value || '0'), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return parsed;
}

export default function LlmPerformanceCaps({ disabled, settings, setSettings }) {
  return (
    <CollapsibleSection title="Performance caps (advanced)" defaultExpanded={false}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <LabeledRow
          label="Threads (optional)"
          description="Lower threads reduces CPU load; leave empty for default behavior."
        >
          <TextInput
            type="number"
            value={settings.threads === null ? '' : String(settings.threads)}
            placeholder="(auto)"
            disabled={disabled}
            onChange={(value) => {
              setSettings((prev) => ({ ...prev, threads: parseIntegerOrNull(value) }));
            }}
          />
        </LabeledRow>

        <LabeledRow
          label="Context tokens"
          description="Lower values reduce memory usage but may reduce analysis quality."
        >
          <TextInput
            type="number"
            value={String(settings.contextTokens)}
            disabled={disabled}
            onChange={(value) => {
              setSettings((prev) => ({
                ...prev,
                contextTokens: parseIntegerOrFallback(value, prev.contextTokens),
              }));
            }}
          />
        </LabeledRow>

        <LabeledRow
          label="Max output tokens"
          description="Caps the analysis size to reduce time and memory."
        >
          <TextInput
            type="number"
            value={String(settings.maxOutputTokens)}
            disabled={disabled}
            onChange={(value) => {
              setSettings((prev) => ({
                ...prev,
                maxOutputTokens: parseIntegerOrFallback(value, prev.maxOutputTokens),
              }));
            }}
          />
        </LabeledRow>

        <LabeledRow
          label="Cooldown (ms)"
          description="Wait time between analyses to avoid spikes when multiple drifts occur."
        >
          <TextInput
            type="number"
            value={String(settings.cooldownMs)}
            disabled={disabled}
            onChange={(value) => {
              setSettings((prev) => ({
                ...prev,
                cooldownMs: parseIntegerOrFallback(value, prev.cooldownMs),
              }));
            }}
          />
        </LabeledRow>

        <LabeledRow
          label="Minimum RAM (GB) to run"
          description="If your machine has less RAM than this, analysis will be skipped."
        >
          <TextInput
            type="number"
            value={String(settings.minRamGb)}
            disabled={disabled}
            onChange={(value) => {
              setSettings((prev) => ({
                ...prev,
                minRamGb: parseIntegerOrFallback(value, prev.minRamGb),
              }));
            }}
          />
        </LabeledRow>
      </div>
    </CollapsibleSection>
  );
}
