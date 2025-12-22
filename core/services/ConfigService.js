import { ConfigFileService } from './ConfigFileService.js';
import { ConfigTransformService } from './ConfigTransformService.js';

/**
 * Service for configuration file operations
 * Composes ConfigFileService and ConfigTransformService
 */
export class ConfigService {
  constructor(logger) {
    this.fileService = new ConfigFileService(logger);
    this.transformService = new ConfigTransformService();
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
}
