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

      const result = this.configService.extractServicesFromFile(filePath, fileContent);

      if (!result.success) {
        const statusCode =
          result.error === 'File not found' ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
        return res.status(statusCode).json(result);
      }

      res.json(result);
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

      const result = this.configService.readConfigFileWithMetadata(filePath);

      if (!result.success) {
        return res.status(HttpStatus.NOT_FOUND).json(result);
      }

      res.json(result);
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
      const homeDir = this.configService.getHomeDir();

      res.json({
        detected,
        platform: process.platform,
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
