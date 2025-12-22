import logger from '#common/logger.js';
import { computeDeterministicSeverity, computeToolManifestDiff } from './diff.js';
import { hashToolManifest, normalizeToolManifest } from './normalize.js';

/**
 * Extract and persist a tool manifest snapshot from a tools/list response
 */
export function persistToolManifestSnapshot(db, serverKey, toolsListResponse, packetFrameNumber) {
  if (!db || !serverKey || !toolsListResponse) {
    logger.warn('Invalid parameters for persistToolManifestSnapshot', {
      hasDb: !!db,
      hasServerKey: !!serverKey,
      hasResponse: !!toolsListResponse,
    });
    return null;
  }

  try {
    const normalized = normalizeToolManifest(toolsListResponse);
    if (!normalized || normalized.toolCount === 0) {
      logger.debug('No tools found in manifest, skipping snapshot', { serverKey });
      return null;
    }

    const manifestHash = hashToolManifest(normalized);
    if (!manifestHash) {
      logger.warn('Failed to compute manifest hash', { serverKey });
      return null;
    }

    const now = Date.now();
    const manifestJson = JSON.stringify(toolsListResponse);
    const normalizedJson = JSON.stringify(normalized);

    const existing = db
      .prepare(
        'SELECT snapshot_id FROM tool_manifest_snapshots WHERE server_key = ? AND manifest_hash = ?'
      )
      .get(serverKey, manifestHash);

    if (existing) {
      logger.debug('Manifest snapshot already exists', {
        serverKey,
        snapshotId: existing.snapshot_id,
        manifestHash,
      });
      return existing.snapshot_id;
    }

    const result = db
      .prepare(
        `INSERT INTO tool_manifest_snapshots 
         (server_key, manifest_hash, manifest_json, normalized_json, tool_count, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(serverKey, manifestHash, manifestJson, normalizedJson, normalized.toolCount, now);

    const snapshotId = result.lastInsertRowid;
    logger.info('Persisted tool manifest snapshot', {
      serverKey,
      snapshotId,
      manifestHash,
      toolCount: normalized.toolCount,
      packetFrameNumber,
    });

    return snapshotId;
  } catch (error) {
    logger.error('Failed to persist tool manifest snapshot', {
      error: error.message,
      serverKey,
      packetFrameNumber,
    });
    return null;
  }
}

/**
 * Create a drift record if the manifest has changed
 * Returns drift_id if created, null if no change
 */
export function createDriftIfChanged(db, serverKey, currentSnapshotId, packetFrameNumber) {
  if (!db || !serverKey || !currentSnapshotId) {
    return null;
  }

  try {
    const current = db
      .prepare('SELECT * FROM tool_manifest_snapshots WHERE snapshot_id = ?')
      .get(currentSnapshotId);

    if (!current) {
      logger.warn('Current snapshot not found', { serverKey, currentSnapshotId });
      return null;
    }

    const previous = db
      .prepare(
        `SELECT * FROM tool_manifest_snapshots 
         WHERE server_key = ? AND snapshot_id < ? 
         ORDER BY snapshot_id DESC LIMIT 1`
      )
      .get(serverKey, currentSnapshotId);

    if (!previous) {
      logger.debug('No previous snapshot found, skipping drift creation', {
        serverKey,
        currentSnapshotId,
      });
      return null;
    }

    if (previous.manifest_hash === current.manifest_hash) {
      logger.debug('Manifest hash unchanged, skipping drift creation', {
        serverKey,
        currentSnapshotId,
        manifestHash: current.manifest_hash,
      });
      return null;
    }

    const baselineNormalized = JSON.parse(previous.normalized_json);
    const currentNormalized = JSON.parse(current.normalized_json);

    const diff = computeToolManifestDiff(baselineNormalized, currentNormalized);
    const severity = computeDeterministicSeverity(diff);

    const now = Date.now();
    const diffJson = JSON.stringify(diff);

    const result = db
      .prepare(
        `INSERT INTO tool_manifest_drifts 
         (server_key, from_snapshot_id, to_snapshot_id, from_hash, to_hash, 
          diff_json, diff_summary, deterministic_severity, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        serverKey,
        previous.snapshot_id,
        currentSnapshotId,
        previous.manifest_hash,
        current.manifest_hash,
        diffJson,
        diff.summary,
        severity,
        now
      );

    const driftId = result.lastInsertRowid;
    logger.info('Created tool manifest drift', {
      serverKey,
      driftId,
      fromSnapshotId: previous.snapshot_id,
      toSnapshotId: currentSnapshotId,
      severity,
      packetFrameNumber,
    });

    return driftId;
  } catch (error) {
    logger.error('Failed to create drift record', {
      error: error.message,
      serverKey,
      currentSnapshotId,
      packetFrameNumber,
    });
    return null;
  }
}

/**
 * Get the latest snapshot for a server
 */
export function getLatestSnapshot(db, serverKey) {
  if (!db || !serverKey) {
    return null;
  }

  try {
    const snapshot = db
      .prepare(
        `SELECT * FROM tool_manifest_snapshots 
         WHERE server_key = ? 
         ORDER BY snapshot_id DESC LIMIT 1`
      )
      .get(serverKey);

    return snapshot || null;
  } catch (error) {
    logger.error('Failed to get latest snapshot', { error: error.message, serverKey });
    return null;
  }
}

/**
 * Get drift by ID
 */
export function getDriftById(db, driftId) {
  if (!db || !driftId) {
    return null;
  }

  try {
    const drift = db.prepare('SELECT * FROM tool_manifest_drifts WHERE drift_id = ?').get(driftId);
    return drift || null;
  } catch (error) {
    logger.error('Failed to get drift by ID', { error: error.message, driftId });
    return null;
  }
}
