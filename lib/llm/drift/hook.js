import logger from '#common/logger.js';
import { analyzeToolDriftWithLLM } from './analyze.js';
import { createDriftIfChanged, persistToolManifestSnapshot } from './persistence.js';

/**
 * Hook into tools/list response to track drift
 * Called after response packet is logged
 */
export async function hookToolsListResponse(
  db,
  frameNumber,
  jsonrpcMethod,
  jsonrpcResult,
  serverKey
) {
  if (!db || !frameNumber || jsonrpcMethod !== 'tools/list' || !jsonrpcResult) {
    return;
  }

  if (!serverKey || typeof serverKey !== 'string') {
    logger.debug('Skipping drift tracking: no server key', { frameNumber });
    return;
  }

  // Normalize server key (remove slashes, trim)
  const normalizedServerKey =
    String(serverKey)
      .trim()
      .replace(/^\/+|\/+$/g, '')
      .replace(/\//g, '_') || 'unknown';

  try {
    // jsonrpcResult is stored as JSON string in database (from extractJsonRpcMetadata)
    const parsedResult = (() => {
      if (typeof jsonrpcResult === 'string') {
        try {
          return JSON.parse(jsonrpcResult);
        } catch (_error) {
          logger.debug('Failed to parse jsonrpc_result as JSON', {
            frameNumber,
            serverKey: normalizedServerKey,
          });
          return null;
        }
      }
      if (typeof jsonrpcResult === 'object' && jsonrpcResult !== null) {
        return jsonrpcResult;
      }
      logger.debug('Invalid jsonrpc_result type', {
        frameNumber,
        serverKey: normalizedServerKey,
        type: typeof jsonrpcResult,
      });
      return null;
    })();

    if (!parsedResult) {
      return;
    }

    // Handle case where result might be wrapped or tools might be at root
    // Normalize to { tools: [...] } format
    const normalizeToolsResponse = (response) => {
      if (Array.isArray(response)) {
        return { tools: response };
      }
      if (response.tools && Array.isArray(response.tools)) {
        return response;
      }
      if (response.result && Array.isArray(response.result)) {
        return { tools: response.result };
      }
      return null;
    };

    const toolsListResponse = normalizeToolsResponse(parsedResult);

    if (!toolsListResponse) {
      logger.debug('tools/list response does not contain tools array', {
        frameNumber,
        serverKey: normalizedServerKey,
        keys: Object.keys(parsedResult),
      });
      return;
    }

    const snapshotId = persistToolManifestSnapshot(
      db,
      normalizedServerKey,
      toolsListResponse,
      frameNumber
    );

    if (!snapshotId) {
      return;
    }

    const driftId = createDriftIfChanged(db, normalizedServerKey, snapshotId, frameNumber);

    if (!driftId) {
      return;
    }

    logger.info('Tool manifest drift detected, triggering LLM analysis', {
      serverKey: normalizedServerKey,
      driftId,
      snapshotId,
      frameNumber,
    });

    const drift = db.prepare('SELECT * FROM tool_manifest_drifts WHERE drift_id = ?').get(driftId);
    if (!drift) {
      return;
    }

    const fromSnapshot = db
      .prepare('SELECT * FROM tool_manifest_snapshots WHERE snapshot_id = ?')
      .get(drift.from_snapshot_id);
    const toSnapshot = db
      .prepare('SELECT * FROM tool_manifest_snapshots WHERE snapshot_id = ?')
      .get(drift.to_snapshot_id);

    if (!fromSnapshot || !toSnapshot) {
      logger.warn('Failed to load snapshots for LLM analysis', {
        driftId,
        serverKey: normalizedServerKey,
      });
      return;
    }

    const baselineManifest = JSON.parse(fromSnapshot.normalized_json);
    const currentManifest = JSON.parse(toSnapshot.normalized_json);
    const diff = JSON.parse(drift.diff_json);

    const analysisResult = await analyzeToolDriftWithLLM(baselineManifest, currentManifest, diff);

    const now = Date.now();

    if (analysisResult.success) {
      db.prepare(
        `UPDATE tool_manifest_drifts 
         SET llm_provider = ?, llm_model = ?, llm_prompt_version = ?, 
             llm_analysis_json = ?, llm_analyzed_at = ?, llm_analysis_error = NULL
         WHERE drift_id = ?`
      ).run(
        analysisResult.provider || 'local',
        analysisResult.model || null,
        analysisResult.promptVersion || null,
        JSON.stringify(analysisResult.analysis),
        now,
        driftId
      );

      logger.info('LLM analysis completed successfully', {
        serverKey: normalizedServerKey,
        driftId,
        riskLevel: analysisResult.analysis?.riskLevel,
      });
    } else {
      db.prepare(
        `UPDATE tool_manifest_drifts 
         SET llm_analysis_error = ?, llm_analyzed_at = ?
         WHERE drift_id = ?`
      ).run(analysisResult.error || 'Unknown error', now, driftId);

      logger.warn('LLM analysis failed', {
        serverKey: normalizedServerKey,
        driftId,
        error: analysisResult.error,
      });
    }
  } catch (error) {
    logger.error('Failed to process tools/list response for drift tracking', {
      error: error.message,
      serverKey: normalizedServerKey || serverKey,
      frameNumber,
      stack: error.stack,
    });
  }
}
