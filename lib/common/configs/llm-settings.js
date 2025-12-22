import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { getLlmSettingsPath, prepareAppDataSpaces } from './paths.js';

const LLM_SETTINGS_VERSION = 1;

function normalizeBoolean(value, fallback) {
  if (typeof value === 'boolean') {
    return value;
  }
  return fallback;
}

function normalizeInteger(value, { fallback, min, max, allowNull }) {
  if (allowNull && value === null) {
    return null;
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return fallback;
  }
  const int = Math.trunc(num);
  if (typeof min === 'number' && int < min) {
    return min;
  }
  if (typeof max === 'number' && int > max) {
    return max;
  }
  return int;
}

function normalizeModelMode(value) {
  if (value === 'auto' || value === 'manual') {
    return value;
  }
  return 'auto';
}

function normalizeString(value, fallback, maxLen) {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }
  if (typeof maxLen === 'number') {
    return trimmed.slice(0, maxLen);
  }
  return trimmed;
}

export function getDefaultLlmSettings() {
  return {
    version: LLM_SETTINGS_VERSION,
    enabled: false,
    autoAnalyzeOnDrift: false,
    modelMode: 'auto',
    modelName: null,
    maxConcurrency: 1,
    threads: null,
    contextTokens: 2048,
    maxOutputTokens: 800,
    cooldownMs: 30_000,
    minRamGb: 8,
  };
}

function normalizeLlmSettings(input) {
  const defaults = getDefaultLlmSettings();
  const obj = input && typeof input === 'object' ? input : {};

  const version = normalizeInteger(obj.version, { fallback: defaults.version, min: 1, max: 10 });
  const enabled = normalizeBoolean(obj.enabled, defaults.enabled);
  const autoAnalyzeOnDrift = normalizeBoolean(obj.autoAnalyzeOnDrift, defaults.autoAnalyzeOnDrift);
  const modelMode = normalizeModelMode(obj.modelMode);
  const modelName = obj.modelName === null ? null : normalizeString(obj.modelName, null, 200);
  const maxConcurrency = normalizeInteger(obj.maxConcurrency, {
    fallback: defaults.maxConcurrency,
    min: 1,
    max: 1,
  });
  const threads = normalizeInteger(obj.threads, {
    fallback: defaults.threads,
    min: 1,
    max: 32,
    allowNull: true,
  });
  const contextTokens = normalizeInteger(obj.contextTokens, {
    fallback: defaults.contextTokens,
    min: 256,
    max: 16_384,
  });
  const maxOutputTokens = normalizeInteger(obj.maxOutputTokens, {
    fallback: defaults.maxOutputTokens,
    min: 64,
    max: 4096,
  });
  const cooldownMs = normalizeInteger(obj.cooldownMs, {
    fallback: defaults.cooldownMs,
    min: 0,
    max: 30 * 60_000,
  });
  const minRamGb = normalizeInteger(obj.minRamGb, {
    fallback: defaults.minRamGb,
    min: 0,
    max: 512,
  });

  const effectiveAutoAnalyzeOnDrift = enabled ? autoAnalyzeOnDrift : false;

  return {
    ...defaults,
    version,
    enabled,
    autoAnalyzeOnDrift: effectiveAutoAnalyzeOnDrift,
    modelMode,
    modelName,
    maxConcurrency,
    threads,
    contextTokens,
    maxOutputTokens,
    cooldownMs,
    minRamGb,
  };
}

export function readLlmSettings() {
  try {
    const settingsPath = getLlmSettingsPath();
    if (!existsSync(settingsPath)) {
      return getDefaultLlmSettings();
    }
    const content = readFileSync(settingsPath, 'utf8');
    const parsed = JSON.parse(content);
    return normalizeLlmSettings(parsed);
  } catch (_error) {
    return getDefaultLlmSettings();
  }
}

export function writeLlmSettings(partial) {
  const existing = readLlmSettings();
  const next = normalizeLlmSettings({ ...existing, ...(partial || {}) });
  const settingsPath = getLlmSettingsPath();
  prepareAppDataSpaces();
  writeFileSync(settingsPath, JSON.stringify(next, null, 2));
  return next;
}
