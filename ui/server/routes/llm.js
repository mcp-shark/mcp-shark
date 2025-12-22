import {
  cancelDepsInstall,
  getDepsInstallStatus,
  startDepsInstall,
} from '../utils/llm-deps-install.js';
import { getModelCatalog } from '../utils/llm-model-catalog.js';
import {
  cancelModelDownload,
  getModelDownloadStatus,
  startModelDownload,
} from '../utils/llm-model-download.js';
import logger from '../utils/logger.js';

export function createLlmRoutes() {
  const router = {};

  router.getCatalog = (_req, res) => {
    res.json({ models: getModelCatalog() });
  };

  router.getDownloadStatus = (_req, res) => {
    res.json(getModelDownloadStatus());
  };

  router.cancelDownload = (_req, res) => {
    res.json(cancelModelDownload());
  };

  router.startDownload = async (req, res) => {
    try {
      const body = req.body && typeof req.body === 'object' ? req.body : {};
      const url = typeof body.url === 'string' ? body.url.trim() : null;
      const fileName = typeof body.fileName === 'string' ? body.fileName.trim() : null;

      if (!url) {
        res.status(400).json({
          error: 'URL is required',
          details: 'Please provide a valid model URL',
        });
        return;
      }

      if (!fileName) {
        res.status(400).json({
          error: 'File name is required',
          details: 'Please provide a file name for the downloaded model',
        });
        return;
      }

      const status = await startModelDownload({ url, fileName });
      res.json({ success: true, status });
    } catch (error) {
      logger.error({ error: error.message }, 'Error downloading model');
      res.status(400).json({
        error: 'Failed to download model',
        details: error.message,
      });
    }
  };

  router.getDepsStatus = (_req, res) => {
    res.json(getDepsInstallStatus());
  };

  router.cancelDepsInstall = (_req, res) => {
    res.json(cancelDepsInstall());
  };

  router.startDepsInstall = (_req, res) => {
    try {
      res.json({ success: true, status: startDepsInstall() });
    } catch (error) {
      logger.error({ error: error.message }, 'Error installing dependencies');
      res.status(500).json({
        error: 'Failed to install dependencies',
        details: error.message,
      });
    }
  };

  return router;
}
