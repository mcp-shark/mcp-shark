import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  getDatabaseFile,
  getLlmSettingsPath,
  getModelsDirectory,
  getWorkingDirectory,
  readLlmSettings,
  writeLlmSettings,
} from '#common/configs';
import { chooseModel } from '#llm/choose-model.js';
import { isNodeLlamaCppInstalled } from '../utils/llm-runtime.js';
import { testLoadModelInSubprocess } from '../utils/llm-test.js';
import logger from '../utils/logger.js';
import { getScanResultsDirectory } from '../utils/scan-cache/directory.js';
import {
  getAvailableModels,
  getBackupCount,
  getSmartScanTokenPath,
  getSystemMemoryInfo,
  getTokenMetadata,
  toDisplayPath,
} from '../utils/settings.js';

const llmTestState = {
  currentPromise: null,
  lastStartedAt: 0,
};

export function createSettingsRoutes() {
  const router = {};

  router.getSettings = (_req, res) => {
    try {
      const homeDir = homedir();
      const workingDir = getWorkingDirectory();
      const databasePath = getDatabaseFile();
      const scanResultsDir = getScanResultsDirectory();
      const tokenPath = getSmartScanTokenPath();
      const tokenMetadata = getTokenMetadata();
      const llmSettingsPath = getLlmSettingsPath();
      const llmSettings = readLlmSettings();
      const modelsDirectory = getModelsDirectory();
      const availableModels = getAvailableModels();

      const cursorConfigPath = join(homeDir, '.cursor', 'mcp.json');
      const windsurfConfigPath = join(homeDir, '.codeium', 'windsurf', 'mcp_config.json');

      const cursorBackupDir = join(homeDir, '.cursor');
      const windsurfBackupDir = join(homeDir, '.codeium', 'windsurf');

      const settings = {
        paths: {
          workingDirectory: {
            absolute: workingDir,
            display: toDisplayPath(workingDir),
            exists: existsSync(workingDir),
          },
          database: {
            absolute: databasePath,
            display: toDisplayPath(databasePath),
            exists: existsSync(databasePath),
          },
          smartScanResults: {
            absolute: scanResultsDir,
            display: toDisplayPath(scanResultsDir),
            exists: existsSync(scanResultsDir),
          },
          smartScanToken: {
            absolute: tokenPath,
            display: toDisplayPath(tokenPath),
            exists: tokenMetadata.exists,
          },
          backupDirectories: {
            cursor: {
              absolute: cursorBackupDir,
              display: toDisplayPath(cursorBackupDir),
              exists: existsSync(cursorBackupDir),
            },
            windsurf: {
              absolute: windsurfBackupDir,
              display: toDisplayPath(windsurfBackupDir),
              exists: existsSync(windsurfBackupDir),
            },
          },
          configFiles: {
            cursor: {
              absolute: cursorConfigPath,
              display: toDisplayPath(cursorConfigPath),
              exists: existsSync(cursorConfigPath),
            },
            windsurf: {
              absolute: windsurfConfigPath,
              display: toDisplayPath(windsurfConfigPath),
              exists: existsSync(windsurfConfigPath),
            },
          },
          llmSettings: {
            absolute: llmSettingsPath,
            display: toDisplayPath(llmSettingsPath),
            exists: existsSync(llmSettingsPath),
          },
          modelsDirectory: {
            absolute: modelsDirectory,
            display: toDisplayPath(modelsDirectory),
            exists: existsSync(modelsDirectory),
          },
        },
        smartScan: {
          token: tokenMetadata.token,
          tokenPath: {
            absolute: tokenMetadata.path,
            display: toDisplayPath(tokenMetadata.path),
          },
          tokenUpdatedAt: tokenMetadata.updatedAt,
          tokenExists: tokenMetadata.exists,
        },
        database: {
          path: {
            absolute: databasePath,
            display: toDisplayPath(databasePath),
          },
          exists: existsSync(databasePath),
        },
        system: {
          platform: process.platform,
          memory: getSystemMemoryInfo(),
          homeDirectory: {
            absolute: homeDir,
            display: '~',
          },
        },
        llm: {
          settings: llmSettings,
          availableModels,
          recommendedModel: chooseModel(),
          runtime: {
            nodeLlamaCppInstalled: isNodeLlamaCppInstalled(),
          },
        },
        backups: {
          directories: [
            {
              absolute: cursorBackupDir,
              display: toDisplayPath(cursorBackupDir),
            },
            {
              absolute: windsurfBackupDir,
              display: toDisplayPath(windsurfBackupDir),
            },
          ],
          count: getBackupCount(),
        },
      };

      res.json(settings);
    } catch (error) {
      logger.error({ error: error.message }, 'Error getting settings');
      res.status(500).json({
        error: 'Failed to get settings',
        details: error.message,
      });
    }
  };

  router.updateLlmSettings = (req, res) => {
    try {
      const nextSettings = writeLlmSettings(req.body || {});
      res.json({ success: true, settings: nextSettings });
    } catch (error) {
      logger.error({ error: error.message }, 'Error updating LLM settings');
      res.status(500).json({
        error: 'Failed to update LLM settings',
        details: error.message,
      });
    }
  };

  router.testLlmModel = async (req, res) => {
    try {
      const llmSettings = readLlmSettings();
      const memory = getSystemMemoryInfo();

      if (!llmSettings.enabled) {
        res.status(400).json({
          error: 'Local LLM analysis is disabled. Enable it in the MCP Server Setup tab first.',
        });
        return;
      }

      if (!isNodeLlamaCppInstalled()) {
        res.status(400).json({
          error:
            'Local LLM dependency is not installed (node-llama-cpp). Run `npm install` in the MCP Shark repo or disable Local LLM analysis.',
        });
        return;
      }

      if (typeof memory.totalGb === 'number' && memory.totalGb < llmSettings.minRamGb) {
        res.status(400).json({
          error: `Insufficient RAM for local LLM analysis (have ${memory.totalGb}GB, need at least ${llmSettings.minRamGb}GB)`,
        });
        return;
      }

      const now = Date.now();
      const cooldownMs = Math.max(0, Number(llmSettings.cooldownMs) || 0);
      if (now - llmTestState.lastStartedAt < cooldownMs) {
        res.status(429).json({
          error: `Cooldown active. Try again in ${cooldownMs - (now - llmTestState.lastStartedAt)}ms`,
        });
        return;
      }

      const body = req.body && typeof req.body === 'object' ? req.body : {};
      const modelMode = body.modelMode === 'manual' ? 'manual' : 'auto';
      const modelName = typeof body.modelName === 'string' ? body.modelName : null;

      const payload = {
        modelMode,
        modelName,
        threads: body.threads ?? null,
        contextTokens: body.contextTokens ?? null,
        maxOutputTokens: body.maxOutputTokens ?? null,
      };

      if (llmTestState.currentPromise) {
        const reused = await llmTestState.currentPromise;
        res.json({
          success: true,
          message: `Model loaded successfully (${reused.modelName})`,
          result: reused,
          reused: true,
        });
        return;
      }

      llmTestState.lastStartedAt = now;
      llmTestState.currentPromise = testLoadModelInSubprocess(payload, { timeoutMs: 120_000 });

      try {
        const result = await llmTestState.currentPromise;
        res.json({
          success: true,
          message: `Model loaded successfully (${result.modelName})`,
          result,
          reused: false,
        });
      } finally {
        llmTestState.currentPromise = null;
      }
    } catch (error) {
      llmTestState.currentPromise = null;
      logger.error({ error: error.message }, 'Error testing LLM model load');
      res.status(500).json({
        error: 'Failed to test model load',
        details: error.message,
      });
    }
  };

  return router;
}
