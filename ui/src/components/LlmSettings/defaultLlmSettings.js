export const DEFAULT_LLM_SETTINGS = {
  enabled: false,
  autoAnalyzeOnDrift: false,
  modelMode: 'auto',
  modelName: null,
  maxConcurrency: 1,
  threads: null,
  contextTokens: 2048,
  maxOutputTokens: 800,
  cooldownMs: 30000,
  minRamGb: 8,
};
