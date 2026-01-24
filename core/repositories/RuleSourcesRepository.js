/**
 * Repository for rule sources operations
 * Handles storage and retrieval of YARA rule sources (GitHub repos, URLs)
 */
export class RuleSourcesRepository {
  constructor(db) {
    this.db = db;
  }

  /**
   * Add or update a rule source
   */
  upsertSource(source) {
    const stmt = this.db.prepare(`
      INSERT INTO rule_sources (name, url, type, branch, path_filter, enabled, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(name) DO UPDATE SET
        url = excluded.url,
        type = excluded.type,
        branch = excluded.branch,
        path_filter = excluded.path_filter,
        enabled = excluded.enabled,
        updated_at = datetime('now')
    `);

    return stmt.run(
      source.name,
      source.url,
      source.type || 'github',
      source.branch || 'main',
      source.path_filter || null,
      source.enabled !== false ? 1 : 0
    );
  }

  /**
   * Get all rule sources
   */
  getSources() {
    return this.db.prepare('SELECT * FROM rule_sources ORDER BY name').all();
  }

  /**
   * Get enabled rule sources
   */
  getEnabledSources() {
    return this.db.prepare('SELECT * FROM rule_sources WHERE enabled = 1 ORDER BY name').all();
  }

  /**
   * Get source by name
   */
  getSourceByName(name) {
    return this.db.prepare('SELECT * FROM rule_sources WHERE name = ?').get(name);
  }

  /**
   * Update source sync status
   */
  updateSourceSyncStatus(name, status, ruleCount = null) {
    const baseSql = `
      UPDATE rule_sources 
      SET last_sync = datetime('now'), last_sync_status = ?, updated_at = datetime('now')
    `;

    if (ruleCount !== null) {
      const sql = `${baseSql}, rule_count = ? WHERE name = ?`;
      return this.db.prepare(sql).run(status, ruleCount, name);
    }

    const sql = `${baseSql} WHERE name = ?`;
    return this.db.prepare(sql).run(status, name);
  }

  /**
   * Delete a source (rules should be deleted separately)
   */
  deleteSource(name) {
    return this.db.prepare('DELETE FROM rule_sources WHERE name = ?').run(name);
  }

  /**
   * Initialize default rule sources
   */
  initializeDefaultSources() {
    const defaultSources = [
      {
        name: 'yara-rules',
        url: 'https://github.com/Yara-Rules/rules',
        type: 'github',
        branch: 'master',
        path_filter: null,
        enabled: true,
      },
      {
        name: 'deepfence-yara',
        url: 'https://github.com/deepfence/yara-rules',
        type: 'github',
        branch: 'main',
        path_filter: null,
        enabled: true,
      },
    ];

    for (const source of defaultSources) {
      const existing = this.getSourceByName(source.name);
      if (!existing) {
        this.upsertSource(source);
      }
    }

    return defaultSources.length;
  }
}
