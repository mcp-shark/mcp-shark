import { getDatabaseFile } from '#common/configs';
import { openDb } from '#common/db/init';
import logger from '#common/logger.js';

export function createDriftsRoutes() {
  const router = {};

  router.listDrifts = async (req, res) => {
    try {
      const dbFile = getDatabaseFile();
      const db = openDb(dbFile);

      const serverKey = typeof req.query.serverKey === 'string' ? req.query.serverKey : null;
      const limit = Number.parseInt(String(req.query.limit || '50'), 10);
      const offset = Number.parseInt(String(req.query.offset || '0'), 10);

      const baseQuery = `
        SELECT 
          d.*,
          s1.tool_count as from_tool_count,
          s2.tool_count as to_tool_count
        FROM tool_manifest_drifts d
        LEFT JOIN tool_manifest_snapshots s1 ON d.from_snapshot_id = s1.snapshot_id
        LEFT JOIN tool_manifest_snapshots s2 ON d.to_snapshot_id = s2.snapshot_id
      `;

      const params = [];
      const whereClause = serverKey ? ' WHERE d.server_key = ?' : '';
      const finalQuery = `${baseQuery}${whereClause} ORDER BY d.created_at DESC LIMIT ? OFFSET ?`;

      if (serverKey) {
        params.push(serverKey);
      }
      params.push(limit, offset);

      const drifts = db.prepare(finalQuery).all(...params);

      const totalQuery = serverKey
        ? 'SELECT COUNT(*) as total FROM tool_manifest_drifts WHERE server_key = ?'
        : 'SELECT COUNT(*) as total FROM tool_manifest_drifts';
      const totalParams = serverKey ? [serverKey] : [];
      const totalResult = db.prepare(totalQuery).get(...totalParams);

      res.json({
        drifts,
        total: totalResult?.total || 0,
        limit,
        offset,
      });
    } catch (error) {
      logger.error('Failed to list drifts', { error: error.message });
      res.status(500).json({ error: 'Failed to list drifts', message: error.message });
    }
  };

  router.getDrift = async (req, res) => {
    try {
      const driftId = Number.parseInt(String(req.params.driftId || '0'), 10);
      if (!driftId || driftId <= 0) {
        res.status(400).json({ error: 'Invalid drift ID' });
        return;
      }

      const dbFile = getDatabaseFile();
      const db = openDb(dbFile);

      const drift = db
        .prepare(
          `SELECT 
            d.*,
            s1.manifest_json as from_manifest_json,
            s1.normalized_json as from_normalized_json,
            s1.tool_count as from_tool_count,
            s2.manifest_json as to_manifest_json,
            s2.normalized_json as to_normalized_json,
            s2.tool_count as to_tool_count
           FROM tool_manifest_drifts d
           LEFT JOIN tool_manifest_snapshots s1 ON d.from_snapshot_id = s1.snapshot_id
           LEFT JOIN tool_manifest_snapshots s2 ON d.to_snapshot_id = s2.snapshot_id
           WHERE d.drift_id = ?`
        )
        .get(driftId);

      if (!drift) {
        res.status(404).json({ error: 'Drift not found' });
        return;
      }

      res.json(drift);
    } catch (error) {
      logger.error('Failed to get drift', { error: error.message, driftId: req.params.driftId });
      res.status(500).json({ error: 'Failed to get drift', message: error.message });
    }
  };

  return router;
}
