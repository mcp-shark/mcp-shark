/**
 * Service for audit logging business logic
 * Coordinates between audit repository and session repository
 * HTTP-agnostic: accepts models, returns models
 */
import { StatusCodeRanges } from '../constants/StatusCodes.js';

export class AuditService {
  constructor(auditRepository, sessionRepository, conversationRepository) {
    this.auditRepository = auditRepository;
    this.sessionRepository = sessionRepository;
    this.conversationRepository = conversationRepository;
  }

  /**
   * Normalize session ID from various header formats
   */
  _normalizeSessionId(headers) {
    if (!headers || typeof headers !== 'object') {
      return null;
    }

    const sessionHeaderKeys = [
      'mcp-session-id',
      'Mcp-Session-Id',
      'X-MCP-Session-Id',
      'x-mcp-session-id',
      'MCP-Session-Id',
    ];

    for (const key of sessionHeaderKeys) {
      if (headers[key]) {
        return headers[key];
      }
    }

    return null;
  }

  /**
   * Calculate duration in milliseconds
   */
  _calculateDurationMs(startNs, endNs) {
    return (endNs - startNs) / 1_000_000;
  }

  /**
   * Log request packet and create conversation entry
   */
  logRequestPacket(options) {
    // Normalize session ID before passing to repository
    const sessionId = this._normalizeSessionId(options.headers) || options.sessionId || null;
    const result = this.auditRepository.logRequestPacket({
      ...options,
      sessionId,
    });

    // Update or create session record
    if (result.sessionId) {
      this.sessionRepository.upsertSession(
        result.sessionId,
        result.timestampNs,
        options.userAgent || null,
        options.remoteAddress || null,
        options.headers?.host || options.headers?.Host || null
      );
    }

    // Create conversation entry for request
    if (result.jsonrpcId) {
      const method = options.body?.method || options.method || null;
      this.conversationRepository.createConversation(
        result.frameNumber,
        result.sessionId,
        result.jsonrpcId,
        method,
        result.timestampNs
      );
    }

    return result;
  }

  /**
   * Log response packet and update conversation entry
   */
  logResponsePacket(options) {
    // Normalize session ID before passing to repository
    const sessionId = this._normalizeSessionId(options.headers) || options.sessionId || null;
    const result = this.auditRepository.logResponsePacket({
      ...options,
      sessionId,
    });

    // Update session record
    if (result.sessionId) {
      this.sessionRepository.upsertSession(
        result.sessionId,
        result.timestampNs,
        options.userAgent || null,
        options.remoteAddress || null,
        options.headers?.host || options.headers?.Host || null
      );
    }

    // Update conversation entry with response
    if (result.jsonrpcId || options.requestFrameNumber) {
      const durationMs = options.requestTimestampNs
        ? this._calculateDurationMs(options.requestTimestampNs, result.timestampNs)
        : null;

      const statusCode = options.statusCode || StatusCodeRanges.SUCCESS_MIN;
      const status =
        statusCode >= StatusCodeRanges.SUCCESS_MIN && statusCode <= StatusCodeRanges.SUCCESS_MAX
          ? 'completed'
          : 'error';

      if (options.requestFrameNumber) {
        // Update existing conversation
        this.conversationRepository.updateConversationWithResponse(
          options.requestFrameNumber,
          result.frameNumber,
          result.timestampNs,
          durationMs,
          status
        );
      } else if (result.jsonrpcId) {
        // Try to find conversation by JSON-RPC ID
        const conv = this.conversationRepository.findConversationByJsonRpcId(result.jsonrpcId);
        if (conv) {
          this.conversationRepository.updateConversationWithResponse(
            conv.request_frame_number,
            result.frameNumber,
            result.timestampNs,
            durationMs,
            status
          );
        }
      }
    }

    return result;
  }
}
