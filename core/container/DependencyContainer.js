import { LoggerLibrary, SerializationLibrary } from '#core/libraries/index.js';
import {
  AuditRepository,
  ConversationRepository,
  PacketRepository,
  SessionRepository,
  StatisticsRepository,
} from '#core/repositories/index.js';
import {
  AuditService,
  BackupService,
  ConfigService,
  ConversationService,
  LogService,
  McpClientService,
  McpDiscoveryService,
  RequestService,
  ScanCacheService,
  ScanService,
  ServerManagementService,
  SessionService,
  SettingsService,
  StatisticsService,
  TokenService,
} from '#core/services/index.js';

/**
 * Dependency Injection Container
 * Manages all dependencies and provides instances of services, repositories, and libraries
 * Follows SOLID principles with dependency inversion
 */
export class DependencyContainer {
  constructor(db) {
    this.db = db;
    this._repositories = {};
    this._services = {};
    this._libraries = {};
  }

  /**
   * Get or create repository instances
   */
  _getRepositories() {
    if (!this._repositories.packet) {
      this._repositories.packet = new PacketRepository(this.db);
    }
    if (!this._repositories.session) {
      this._repositories.session = new SessionRepository(this.db);
    }
    if (!this._repositories.conversation) {
      this._repositories.conversation = new ConversationRepository(this.db);
    }
    if (!this._repositories.audit) {
      this._repositories.audit = new AuditRepository(this.db);
    }
    if (!this._repositories.statistics) {
      this._repositories.statistics = new StatisticsRepository(this.db);
    }

    return this._repositories;
  }

  /**
   * Get or create library instances
   */
  _getLibraries() {
    if (!this._libraries.serialization) {
      this._libraries.serialization = new SerializationLibrary();
    }
    if (!this._libraries.logger) {
      this._libraries.logger = new LoggerLibrary();
    }

    return this._libraries;
  }

  /**
   * Get or create service instances
   */
  _getServices() {
    if (Object.keys(this._services).length === 0) {
      const repos = this._getRepositories();
      const libs = this._getLibraries();

      this._services.request = new RequestService(repos.packet);
      this._services.session = new SessionService(repos.session, repos.packet);
      this._services.conversation = new ConversationService(repos.conversation);
      this._services.statistics = new StatisticsService(
        repos.statistics,
        repos.packet,
        repos.conversation
      );
      this._services.audit = new AuditService(repos.audit, repos.session, repos.conversation);
      this._services.config = new ConfigService(libs.logger);
      this._services.serverManagement = new ServerManagementService(
        this._services.config,
        libs.logger
      );
      this._services.backup = new BackupService(this._services.config, libs.logger);
      this._services.log = new LogService(libs.logger);
      this._services.scanCache = new ScanCacheService(libs.logger);
      this._services.scan = new ScanService(this._services.scanCache, libs.logger);
      this._services.mcpDiscovery = new McpDiscoveryService(this._services.config, libs.logger);
      this._services.mcpClient = new McpClientService(libs.logger);
      this._services.token = new TokenService(libs.logger);
      this._services.settings = new SettingsService(
        this._services.token,
        this._services.backup,
        libs.logger
      );
    }

    return this._services;
  }

  /**
   * Get a service by name
   */
  getService(serviceName) {
    const services = this._getServices();
    return services[serviceName];
  }

  /**
   * Get a repository by name
   */
  getRepository(repositoryName) {
    const repos = this._getRepositories();
    return repos[repositoryName];
  }

  /**
   * Get a library by name
   */
  getLibrary(libraryName) {
    const libs = this._getLibraries();
    return libs[libraryName];
  }

  /**
   * Get audit logger (wrapper around AuditService for backward compatibility)
   */
  getAuditLogger() {
    const auditService = this.getService('audit');
    return {
      logRequestPacket: (options) => auditService.logRequestPacket(options),
      logResponsePacket: (options) => auditService.logResponsePacket(options),
    };
  }
}
