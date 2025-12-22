/**
 * Service for configuration file operations
 * Composes ConfigFileService and ConfigTransformService
 * Uses dependency injection for all dependencies
 */
export class ConfigService {
  /**
   * @param {Object} logger - Logger instance
   * @param {ConfigFileService} configFileService - File service instance
   * @param {ConfigTransformService} configTransformService - Transform service instance
   * @param {ConfigDetectionService} configDetectionService - Detection service instance
   */
  constructor(logger, configFileService, configTransformService, configDetectionService) {
    this.fileService = configFileService;
    this.transformService = configTransformService;
    this.detectionService = configDetectionService;
    this.logger = logger;
  }

  resolveFilePath(filePath) {
    return this.fileService.resolveFilePath(filePath);
  }

  resolveFileData(filePath, fileContent) {
    return this.fileService.resolveFileData(filePath, fileContent);
  }

  parseJsonConfig(content) {
    return this.fileService.parseJsonConfig(content);
  }

  tryParseJson(content) {
    return this.fileService.tryParseJson(content);
  }

  readConfigFile(filePath) {
    return this.fileService.readConfigFile(filePath);
  }

  writeConfigFile(filePath, content) {
    return this.fileService.writeConfigFile(filePath, content);
  }

  fileExists(filePath) {
    return this.fileService.fileExists(filePath);
  }

  convertMcpServersToServers(config) {
    return this.transformService.convertMcpServersToServers(config);
  }

  extractServices(config) {
    return this.transformService.extractServices(config);
  }

  filterServers(config, selectedServices) {
    return this.transformService.filterServers(config, selectedServices);
  }

  detectConfigFiles() {
    return this.fileService.detectConfigFiles();
  }

  getMcpConfigPath() {
    return this.fileService.getMcpConfigPath();
  }

  readMcpConfig() {
    return this.fileService.readMcpConfig();
  }

  getServersFromConfig() {
    return this.fileService.getServersFromConfig();
  }

  updateConfigForMcpShark(originalConfig) {
    return this.transformService.updateConfigForMcpShark(originalConfig);
  }

  getSelectedServiceNames(originalConfig, selectedServices) {
    return this.transformService.getSelectedServiceNames(originalConfig, selectedServices);
  }

  storeOriginalConfig(filePath, originalContent, backupPath) {
    return this.fileService.storeOriginalConfig(filePath, originalContent, backupPath);
  }

  restoreOriginalConfig() {
    return this.fileService.restoreOriginalConfig();
  }

  clearOriginalConfig() {
    return this.fileService.clearOriginalConfig();
  }

  getFileType(filePath) {
    return this.fileService.getFileType(filePath);
  }

  getDisplayPath(filePath) {
    return this.fileService.getDisplayPath(filePath);
  }

  getHomeDir() {
    return this.fileService.getHomeDir();
  }

  /**
   * Extract services from file (handles full flow)
   */
  extractServicesFromFile(filePath, fileContent) {
    const fileData = this.fileService.resolveFileData(filePath, fileContent);
    if (!fileData) {
      const resolvedFilePath = filePath ? this.fileService.resolveFilePath(filePath) : null;
      return {
        success: false,
        error: 'File not found',
        path: resolvedFilePath,
      };
    }

    const parseResult = this.fileService.parseJsonConfig(
      fileData.content,
      fileData.resolvedFilePath
    );
    if (!parseResult.config) {
      const fileType = this.fileService.getFileType(fileData.resolvedFilePath);
      return {
        success: false,
        error: `Invalid ${fileType} file`,
        details: parseResult.error ? parseResult.error.message : `Failed to parse ${fileType}`,
      };
    }

    const services = this.transformService.extractServices(parseResult.config);
    return {
      success: true,
      services,
    };
  }

  /**
   * Read config file with metadata
   */
  readConfigFileWithMetadata(filePath) {
    const resolvedPath = this.fileService.resolveFilePath(filePath);

    if (!this.fileService.fileExists(resolvedPath)) {
      return {
        success: false,
        error: 'File not found',
        path: resolvedPath,
      };
    }

    const content = this.fileService.readConfigFile(resolvedPath);
    const parsed = this.fileService.tryParseJson(content, resolvedPath);

    return {
      success: true,
      filePath: resolvedPath,
      displayPath: this.fileService.getDisplayPath(resolvedPath),
      content,
      parsed,
      exists: true,
    };
  }

  /**
   * Process setup: parse, convert, filter, and prepare config
   */
  processSetup(filePath, fileContent, selectedServices) {
    const fileData = this.fileService.resolveFileData(filePath, fileContent);
    if (!fileData) {
      const resolvedFilePath = filePath ? this.fileService.resolveFilePath(filePath) : null;
      return {
        success: false,
        error: 'File not found',
        path: resolvedFilePath,
      };
    }

    const parseResult = this.fileService.parseJsonConfig(
      fileData.content,
      fileData.resolvedFilePath
    );
    if (!parseResult.config) {
      const fileType = this.fileService.getFileType(fileData.resolvedFilePath);
      return {
        success: false,
        error: `Invalid ${fileType} file`,
        details: parseResult.error ? parseResult.error.message : `Failed to parse ${fileType}`,
      };
    }

    const originalConfig = parseResult.config;
    const baseConvertedConfig = this.transformService.convertMcpServersToServers(originalConfig);

    const convertedConfig =
      selectedServices && Array.isArray(selectedServices) && selectedServices.length > 0
        ? this.transformService.filterServers(baseConvertedConfig, selectedServices)
        : baseConvertedConfig;

    if (Object.keys(convertedConfig.servers || {}).length === 0) {
      return {
        success: false,
        error: 'No servers found in config',
      };
    }

    const updatedConfig = this.transformService.updateConfigForMcpShark(originalConfig);

    return {
      success: true,
      fileData,
      originalConfig,
      convertedConfig,
      updatedConfig,
    };
  }

  /**
   * Write config as JSON string
   * @param {string} filePath - Path to config file
   * @param {object} config - Config object to write
   */
  writeConfigAsJson(filePath, config) {
    const jsonContent = JSON.stringify(config, null, 2);
    this.fileService.writeConfigFile(filePath, jsonContent);
  }

  /**
   * Check if config file is patched by mcp-shark
   */
  isConfigPatched(config) {
    return this.transformService.isConfigPatched(config);
  }

  /**
   * Check if a file path contains a patched config
   */
  isFilePatched(filePath) {
    if (!this.fileService.fileExists(filePath)) {
      return false;
    }
    const content = this.fileService.readConfigFile(filePath);
    const parseResult = this.fileService.parseJsonConfig(content, filePath);
    return parseResult.config ? this.isConfigPatched(parseResult.config) : false;
  }
}
