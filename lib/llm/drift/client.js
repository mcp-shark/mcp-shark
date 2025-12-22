import { getLlama, resolveModelFile } from 'node-llama-cpp';
import { getModelsDirectory, readLlmSettings } from '#common/configs';
import logger from '#common/logger.js';
import { chooseModel } from '#llm/choose-model.js';
import { validateLlmAnalysis } from './schema.js';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

/**
 * LLM client for tool drift analysis
 * Uses node-llama-cpp to generate structured JSON analysis
 */
export class LLMDriftClient {
  constructor() {
    this.modelCache = null;
    this.llamaInstance = null;
  }

  /**
   * Generate JSON analysis for tool drift
   * Returns { success: true, data } or { success: false, error }
   */
  async generateJSON(prompt, options = {}) {
    const settings = readLlmSettings();

    if (!settings.enabled) {
      return { success: false, error: 'LLM analysis is disabled' };
    }

    const modelName =
      settings.modelMode === 'manual' && settings.modelName ? settings.modelName : chooseModel();
    const contextTokens = options.contextTokens ?? settings.contextTokens ?? 2048;
    const maxOutputTokens = options.maxOutputTokens ?? settings.maxOutputTokens ?? 800;
    const threads = options.threads ?? settings.threads ?? null;

    try {
      const model = await this.loadModel(modelName);
      const session = await model.createSession({
        contextSize: contextTokens,
        threads: threads || undefined,
      });

      const promptText = `You are a cybersecurity expert. ${prompt}`;

      const completion = await session.completion({
        prompt: promptText,
        maxTokens: maxOutputTokens,
        temperature: 0.1,
        topP: 0.9,
      });

      const rawText = completion.text.trim();

      const extractJsonString = (text) => {
        if (text.includes('```json')) {
          const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch?.[1]) {
            return jsonMatch[1].trim();
          }
        }
        if (text.includes('```')) {
          const codeMatch = text.match(/```\s*([\s\S]*?)\s*```/);
          if (codeMatch?.[1]) {
            return codeMatch[1].trim();
          }
        }
        return text;
      };

      const jsonString = extractJsonString(rawText);

      if (jsonString.startsWith('{') && jsonString.endsWith('}')) {
        const validation = validateLlmAnalysis(jsonString);
        if (validation.success) {
          return { success: true, data: validation.data, rawText };
        }

        for (const attempt of Array(MAX_RETRIES).keys()) {
          await new Promise((resolve) => {
            setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1));
          });

          const retryCompletion = await session.completion({
            prompt: `${promptText}\n\nPrevious attempt failed validation. Please ensure your response is valid JSON matching the exact schema.`,
            maxTokens: maxOutputTokens,
            temperature: 0.05,
            topP: 0.8,
          });

          const retryText = retryCompletion.text.trim();
          const retryJson = retryText
            .replace(/```json\s*|\s*```/g, '')
            .replace(/```/g, '')
            .trim();

          if (retryJson.startsWith('{') && retryJson.endsWith('}')) {
            const retryValidation = validateLlmAnalysis(retryJson);
            if (retryValidation.success) {
              return { success: true, data: retryValidation.data, rawText: retryText };
            }
          }
        }

        return {
          success: false,
          error: validation.error || 'Failed to generate valid JSON after retries',
        };
      }

      return { success: false, error: 'LLM response does not contain valid JSON' };
    } catch (error) {
      logger.error('LLM drift analysis failed', {
        error: error.message,
        modelName,
        stack: error.stack,
      });
      return { success: false, error: `LLM analysis error: ${error.message}` };
    }
  }

  async loadModel(modelName) {
    if (this.modelCache && this.modelCache.name === modelName) {
      return this.modelCache.model;
    }

    const modelsDirectory = getModelsDirectory();
    const modelPath = await resolveModelFile(modelName, modelsDirectory);

    if (!this.llamaInstance) {
      this.llamaInstance = await getLlama();
    }

    const model = await this.llamaInstance.loadModel({ modelPath });

    this.modelCache = {
      name: modelName,
      model,
    };

    logger.info('LLM model loaded for drift analysis', { modelName, modelPath });
    return model;
  }

  /**
   * Clear model cache (useful for memory management)
   */
  clearCache() {
    this.modelCache = null;
    this.llamaInstance = null;
  }
}
