import { useEffect, useMemo, useState } from 'react';
import { colors, fonts } from '../../theme';
import LlmDependencyInstaller from './LlmDependencyInstaller.jsx';
import LlmModelDownloader from './LlmModelDownloader.jsx';
import LlmPerformanceCaps from './LlmPerformanceCaps.jsx';
import LlmSettingsActions from './LlmSettingsActions.jsx';
import { LabeledRow, Notice, Select, Toggle } from './LlmSettingsUi.jsx';
import { DEFAULT_LLM_SETTINGS } from './defaultLlmSettings.js';

export default function LlmSettingsSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_LLM_SETTINGS);
  const [availableModels, setAvailableModels] = useState([]);
  const [recommendedModel, setRecommendedModel] = useState(null);
  const [paths, setPaths] = useState(null);
  const [memory, setMemory] = useState(null);
  const [llmRuntime, setLlmRuntime] = useState(null);

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load settings');
      }
      setPaths(data.paths || null);
      setMemory(data.system?.memory || null);
      setAvailableModels(data.llm?.availableModels || []);
      setRecommendedModel(data.llm?.recommendedModel || null);
      setLlmRuntime(data.llm?.runtime || null);
      setSettings({ ...DEFAULT_LLM_SETTINGS, ...(data.llm?.settings || {}) });
    } catch (err) {
      setError(err.message || 'Failed to load settings');
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/settings', { signal: controller.signal });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load settings');
        }

        setPaths(data.paths || null);
        setMemory(data.system?.memory || null);
        setAvailableModels(data.llm?.availableModels || []);
        setRecommendedModel(data.llm?.recommendedModel || null);
        setLlmRuntime(data.llm?.runtime || null);
        setSettings({ ...DEFAULT_LLM_SETTINGS, ...(data.llm?.settings || {}) });
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load settings');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const modelOptions = useMemo(() => {
    const modelItems = availableModels.map((m) => {
      return { label: m.name, value: m.name };
    });

    return [{ label: 'Auto (recommended)', value: 'auto' }, ...modelItems];
  }, [availableModels]);

  const modelSelectValue = settings.modelMode === 'auto' ? 'auto' : settings.modelName || 'auto';

  const isLowRam =
    typeof memory?.totalGb === 'number' &&
    typeof settings?.minRamGb === 'number' &&
    memory.totalGb > 0 &&
    memory.totalGb < settings.minRamGb;

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      enabled: settings.enabled,
      autoAnalyzeOnDrift: settings.autoAnalyzeOnDrift,
      modelMode: settings.modelMode,
      modelName: settings.modelName,
      maxConcurrency: settings.maxConcurrency,
      threads: settings.threads,
      contextTokens: settings.contextTokens,
      maxOutputTokens: settings.maxOutputTokens,
      cooldownMs: settings.cooldownMs,
      minRamGb: settings.minRamGb,
    };

    try {
      const res = await fetch('/api/settings/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to save settings');
      }
      setSettings({ ...DEFAULT_LLM_SETTINGS, ...(data.settings || {}) });
      setMessage('Saved LLM settings');
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testLoad = async () => {
    setTesting(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/settings/llm/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelMode: settings.modelMode,
          modelName: settings.modelName,
          threads: settings.threads,
          contextTokens: settings.contextTokens,
          maxOutputTokens: settings.maxOutputTokens,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorMsg = data?.error || data?.details || `Test failed (${res.status})`;
        throw new Error(errorMsg);
      }
      setMessage(data.message || 'Model loaded successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg || 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  const disabled = loading || saving;

  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: `0 2px 4px ${colors.shadowSm}`,
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h3
          style={{
            fontSize: '15px',
            fontWeight: '600',
            marginBottom: '8px',
            color: colors.textPrimary,
            fontFamily: fonts.body,
          }}
        >
          Local LLM Drift Analysis
        </h3>
        <p
          style={{
            fontSize: '13px',
            color: colors.textSecondary,
            lineHeight: '1.5',
            fontFamily: fonts.body,
          }}
        >
          Configure optional local LLM analysis for tool drift. This can increase CPU/RAM usage.
        </p>
      </div>

      {paths?.llmSettings && (
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: '12px',
            color: colors.textSecondary,
            marginBottom: '12px',
          }}
        >
          Settings file:{' '}
          <span style={{ color: colors.textPrimary }}>{paths.llmSettings.display}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <LabeledRow
          label="Enable local LLM analysis"
          description="When enabled, MCP Shark may load a local model to analyze tool drift. If disabled, no model is loaded."
        >
          <Toggle
            checked={settings.enabled}
            onChange={(value) => setSettings((prev) => ({ ...prev, enabled: value }))}
            disabled={disabled}
          />
        </LabeledRow>

        <LabeledRow
          label="Auto-run on drift"
          description="Automatically analyze every new drift record. This can be heavy if tools change frequently."
        >
          <Toggle
            checked={settings.autoAnalyzeOnDrift}
            onChange={(value) => setSettings((prev) => ({ ...prev, autoAnalyzeOnDrift: value }))}
            disabled={disabled || !settings.enabled}
          />
        </LabeledRow>

        <LabeledRow
          label="Model"
          description={
            recommendedModel
              ? `Recommended by your machine: ${recommendedModel}`
              : 'Select a locally installed GGUF model in ~/.mcp-shark/models.'
          }
        >
          <Select
            value={modelSelectValue}
            disabled={disabled}
            options={modelOptions}
            onChange={(value) => {
              if (value === 'auto') {
                setSettings((prev) => ({ ...prev, modelMode: 'auto', modelName: null }));
                return;
              }
              setSettings((prev) => ({ ...prev, modelMode: 'manual', modelName: value }));
            }}
          />
        </LabeledRow>

        <LlmPerformanceCaps disabled={disabled} settings={settings} setSettings={setSettings} />

        <LlmSettingsActions
          disabled={disabled}
          saving={saving}
          testing={testing}
          onSave={save}
          onTest={testLoad}
        />

        <LlmDependencyInstaller
          llmRuntime={llmRuntime}
          disabled={disabled}
          onInstalled={refreshSettings}
        />

        <LlmModelDownloader
          paths={paths}
          disabled={disabled}
          availableModels={availableModels}
          onRefreshSettings={refreshSettings}
        />

        {message && (
          <div style={{ fontFamily: fonts.body, fontSize: '13px', color: colors.accentGreen }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ fontFamily: fonts.body, fontSize: '13px', color: colors.accentRed }}>
            {error}
          </div>
        )}

        {llmRuntime?.nodeLlamaCppInstalled === false && (
          <Notice tone="danger" title="Local LLM dependency missing">
            MCP Shark cannot load local models because{' '}
            <span style={{ color: colors.textPrimary }}>node-llama-cpp</span> is not installed. Run{' '}
            <span style={{ color: colors.textPrimary }}>npm install</span> in the MCP Shark repo or
            disable Local LLM analysis.
          </Notice>
        )}

        <Notice tone="warning" title="Resource warning">
          Model files can be large (hundreds of MB to multiple GB). Loading a local model can use
          significant RAM/CPU and may slow down your machine. Keep auto-run off if you’re on a tight
          laptop.
        </Notice>

        {isLowRam && (
          <Notice tone="danger" title="RAM threshold warning">
            Your system reports {memory.totalGb}GB total RAM, which is below the configured minimum
            ({settings.minRamGb}GB). MCP Shark will skip local LLM analysis until you lower the
            threshold or run on a machine with more RAM.
          </Notice>
        )}
      </div>
    </div>
  );
}
