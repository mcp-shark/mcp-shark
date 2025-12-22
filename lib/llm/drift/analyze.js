import { readLlmSettings } from '#common/configs';
import logger from '#common/logger.js';
import { LLMDriftClient } from './client.js';
import { compactManifestForPrompt } from './normalize.js';
import { buildDriftAnalysisPrompt, compactDiffForPrompt } from './prompt.js';

/**
 * Analyze tool drift with LLM
 * Returns { success: true, analysis } or { success: false, error }
 */
export async function analyzeToolDriftWithLLM(baselineManifest, currentManifest, diff) {
  const settings = readLlmSettings();

  if (!settings.enabled || !settings.autoAnalyzeOnDrift) {
    return { success: false, error: 'LLM analysis is disabled or auto-analyze is off' };
  }

  try {
    const baselineCompact = compactManifestForPrompt(baselineManifest);
    const currentCompact = compactManifestForPrompt(currentManifest);
    const compactDiff = compactDiffForPrompt(diff, 10);

    const { prompt, version } = buildDriftAnalysisPrompt(
      baselineCompact,
      currentCompact,
      compactDiff
    );

    const client = new LLMDriftClient();
    const result = await client.generateJSON(prompt, {
      contextTokens: settings.contextTokens,
      maxOutputTokens: settings.maxOutputTokens,
      threads: settings.threads,
    });

    if (result.success) {
      return {
        success: true,
        analysis: result.data,
        provider: 'local',
        model: settings.modelMode === 'manual' && settings.modelName ? settings.modelName : 'auto',
        promptVersion: version,
      };
    }

    return result;
  } catch (error) {
    logger.error('Failed to analyze tool drift with LLM', {
      error: error.message,
      stack: error.stack,
    });
    return { success: false, error: `Analysis failed: ${error.message}` };
  }
}
