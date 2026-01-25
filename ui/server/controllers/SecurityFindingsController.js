import { StatusCodes } from '#core/constants/index.js';
import { handleError, handleValidationError } from '../utils/errorHandler.js';

/**
 * Controller for Security Detection and Findings HTTP endpoints
 */
export class SecurityFindingsController {
  constructor(securityDetectionService, serverManagementService, logger) {
    this.securityService = securityDetectionService;
    this.serverManagementService = serverManagementService;
    this.logger = logger;
  }

  /**
   * Get all security rules metadata
   */
  getRules = (_req, res) => {
    try {
      const rules = this.securityService.getRules();
      return res.json({
        success: true,
        rules,
        count: rules.length,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error getting security rules');
    }
  };

  /**
   * Scan a single MCP server configuration
   */
  scanServer = async (req, res) => {
    try {
      const { serverConfig } = req.body;

      if (!serverConfig) {
        return handleValidationError('Server configuration is required', res, this.logger);
      }

      const result = await this.securityService.scanServerConfig(serverConfig);
      return res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error scanning server');
    }
  };

  /**
   * Scan multiple MCP servers
   */
  scanMultipleServers = async (req, res) => {
    try {
      const { servers } = req.body;

      if (!servers || !Array.isArray(servers) || servers.length === 0) {
        return handleValidationError('Servers array is required', res, this.logger);
      }

      const result = await this.securityService.scanMultipleServers(servers);
      return res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error scanning multiple servers');
    }
  };

  /**
   * Analyse only currently running/connected MCP servers
   * Uses servers that MCP Shark proxy is actively connected to
   */
  analyseRunningServers = async (_req, res) => {
    try {
      // Check if proxy is running and get connected servers
      const connectedServers = this.serverManagementService.getConnectedServers();

      if (connectedServers.length === 0) {
        return res.json({
          success: false,
          error: 'No MCP servers are running. Start servers via the Setup tab.',
          requiresSetup: true,
          serversScanned: 0,
          totalFindings: 0,
          results: [],
        });
      }

      const result = await this.securityService.scanMultipleServers(connectedServers);

      return res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error analysing running servers');
    }
  };

  /**
   * Get findings with filters
   */
  getFindings = (req, res) => {
    try {
      const filters = {
        severity: req.query.severity,
        owasp_id: req.query.owasp_id,
        server_name: req.query.server_name,
        finding_type: req.query.finding_type,
        scan_id: req.query.scan_id,
        rule_id: req.query.rule_id,
        limit: req.query.limit ? Number.parseInt(req.query.limit, 10) : 100,
        offset: req.query.offset ? Number.parseInt(req.query.offset, 10) : 0,
      };

      const findings = this.securityService.getFindings(filters);
      const count = this.securityService.getFindingsCount(filters);

      return res.json({
        success: true,
        findings,
        count,
        limit: filters.limit,
        offset: filters.offset,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error getting findings');
    }
  };

  /**
   * Get a single finding by ID
   */
  getFinding = (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return handleValidationError('Finding ID is required', res, this.logger);
      }

      const finding = this.securityService.getFindingById(Number.parseInt(id, 10));

      if (!finding) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: 'Finding not found',
        });
      }

      return res.json({
        success: true,
        finding,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error getting finding');
    }
  };

  /**
   * Get summary statistics
   */
  getSummary = (_req, res) => {
    try {
      const summary = this.securityService.getSummary();
      return res.json({
        success: true,
        summary,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error getting security summary');
    }
  };

  /**
   * Get scan history
   */
  getScanHistory = (req, res) => {
    try {
      const limit = req.query.limit ? Number.parseInt(req.query.limit, 10) : 20;
      const history = this.securityService.getScanHistory(limit);
      return res.json({
        success: true,
        history,
        count: history.length,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error getting scan history');
    }
  };

  /**
   * Clear all findings
   */
  clearFindings = (_req, res) => {
    try {
      const deletedCount = this.securityService.clearAllFindings();
      return res.json({
        success: true,
        message: `Cleared ${deletedCount} finding${deletedCount !== 1 ? 's' : ''}`,
        deletedCount,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error clearing findings');
    }
  };

  /**
   * Delete findings for a specific scan
   */
  deleteScanFindings = (req, res) => {
    try {
      const { scanId } = req.params;

      if (!scanId) {
        return handleValidationError('Scan ID is required', res, this.logger);
      }

      const deletedCount = this.securityService.deleteScanFindings(scanId);
      return res.json({
        success: true,
        message: `Deleted ${deletedCount} finding${deletedCount !== 1 ? 's' : ''} for scan ${scanId}`,
        deletedCount,
      });
    } catch (error) {
      handleError(error, res, this.logger, 'Error deleting scan findings');
    }
  };
}
