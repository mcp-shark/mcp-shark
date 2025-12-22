import { homedir } from 'node:os';
import { HttpStatus } from '#core/constants';

/**
 * Controller for configuration-related HTTP endpoints
 * Handles HTTP request/response translation for config operations
 */
export class ConfigController {
  constructor(configService, logger) {
    this.configService = configService;
    this.logger = logger;
  }

  /**
   * Extract services from config file
   */
  extractServices = (req, res) => {
    try {
      const { filePath, fileContent } = req.body;

      if (!filePath && !fileContent) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Either filePath or fileContent is required',
        });
      }

      const fileData = this.configService.resolveFileData(filePath, fileContent);

      if (!fileData) {
        const resolvedFilePath = filePath ? this.configService.resolveFilePath(filePath) : null;
        return res.status(HttpStatus.NOT_FOUND).json({
          error: 'File not found',
          path: resolvedFilePath,
        });
      }

      const parseResult = this.configService.parseJsonConfig(fileData.content);

      if (!parseResult.config) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Invalid JSON file',
          details: parseResult.error ? parseResult.error.message : 'Failed to parse JSON',
        });
      }

      const services = this.configService.extractServices(parseResult.config);
      res.json({ success: true, services });
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error extracting services');
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to extract services',
        details: error.message,
      });
    }
  };

  /**
   * Read config file
   */
  readConfig = (req, res) => {
    try {
      const { filePath } = req.query;

      if (!filePath) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'filePath is required' });
      }

      const resolvedPath = this.configService.resolveFilePath(filePath);

      if (!this.configService.fileExists(resolvedPath)) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ error: 'File not found', path: resolvedPath });
      }

      const content = this.configService.readConfigFile(resolvedPath);
      const parsed = this.configService.tryParseJson(content);
      const homeDir = homedir();

      res.json({
        success: true,
        filePath: resolvedPath,
        displayPath: resolvedPath.replace(homeDir, '~'),
        content: content,
        parsed: parsed,
        exists: true,
      });
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error reading config');
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to read file',
        details: error.message,
      });
    }
  };

  /**
   * Detect config files on the system
   */
  detectConfig = (_req, res) => {
    try {
      const detected = this.configService.detectConfigFiles();
      const platform = process.platform;
      const homeDir = homedir();

      res.json({
        detected: detected,
        platform,
        homeDir,
      });
    } catch (error) {
      this.logger?.error({ error: error.message }, 'Error detecting config');
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to detect config files',
        details: error.message,
      });
    }
  };
}
