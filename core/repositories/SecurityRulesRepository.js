/**
 * Repository for security rules operations
 * Handles storage and retrieval of community YARA rules
 * Note: Schema is managed by SchemaRepository - table created with IF NOT EXISTS
 */
import { RuleSourcesRepository } from './RuleSourcesRepository.js';

export class SecurityRulesRepository {
  constructor(db) {
    this.db = db;
    this._sourcesRepo = new RuleSourcesRepository(db);
  }

  /**
   * Insert or update a single rule
   */
  upsertRule(rule) {
    const stmt = this.db.prepare(`
      INSERT INTO security_rules (
        rule_id, source, source_url, name, description, author, reference,
        content, owasp_id, severity, tags, enabled, version, file_path, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(rule_id) DO UPDATE SET
        source = excluded.source,
        source_url = excluded.source_url,
        name = excluded.name,
        description = excluded.description,
        author = excluded.author,
        reference = excluded.reference,
        content = excluded.content,
        owasp_id = excluded.owasp_id,
        severity = excluded.severity,
        tags = excluded.tags,
        enabled = excluded.enabled,
        version = excluded.version,
        file_path = excluded.file_path,
        updated_at = datetime('now')
    `);

    return stmt.run(
      rule.rule_id,
      rule.source,
      rule.source_url || null,
      rule.name,
      rule.description || null,
      rule.author || null,
      rule.reference || null,
      rule.content,
      rule.owasp_id || null,
      rule.severity || 'medium',
      rule.tags || null,
      rule.enabled !== false ? 1 : 0,
      rule.version || null,
      rule.file_path || null
    );
  }

  /**
   * Insert multiple rules in a transaction
   */
  upsertRules(rules) {
    const insertMany = this.db.transaction((ruleList) => {
      const results = [];
      for (const rule of ruleList) {
        const result = this.upsertRule(rule);
        results.push(result);
      }
      return results;
    });

    return insertMany(rules);
  }

  /**
   * Get all rules with optional filters
   */
  getRules(filters = {}) {
    const { sql, params } = this._buildRulesQuery(filters);
    return this.db.prepare(sql).all(...params);
  }

  /**
   * Build SQL query for rules with filters
   */
  _buildRulesQuery(filters) {
    const conditions = ['1=1'];
    const params = [];

    if (filters.source) {
      conditions.push('source = ?');
      params.push(filters.source);
    }

    if (filters.severity) {
      conditions.push('severity = ?');
      params.push(filters.severity);
    }

    if (filters.enabled !== undefined) {
      conditions.push('enabled = ?');
      params.push(filters.enabled ? 1 : 0);
    }

    if (filters.owasp_id) {
      conditions.push('owasp_id = ?');
      params.push(filters.owasp_id);
    }

    if (filters.search) {
      conditions.push('(name LIKE ? OR description LIKE ? OR tags LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const baseSql = `SELECT * FROM security_rules WHERE ${conditions.join(' AND ')} ORDER BY updated_at DESC`;
    const sql = filters.limit ? `${baseSql} LIMIT ?` : baseSql;

    if (filters.limit) {
      params.push(filters.limit);
    }

    return { sql, params };
  }

  /**
   * Get rule by ID
   */
  getRuleById(ruleId) {
    return this.db.prepare('SELECT * FROM security_rules WHERE rule_id = ?').get(ruleId);
  }

  /**
   * Get rules by source
   */
  getRulesBySource(source) {
    return this.db
      .prepare('SELECT * FROM security_rules WHERE source = ? ORDER BY name')
      .all(source);
  }

  /**
   * Get enabled rules
   */
  getEnabledRules() {
    return this.db
      .prepare('SELECT * FROM security_rules WHERE enabled = 1 ORDER BY severity DESC, name')
      .all();
  }

  /**
   * Enable or disable a rule
   */
  setRuleEnabled(ruleId, enabled) {
    return this.db
      .prepare(
        "UPDATE security_rules SET enabled = ?, updated_at = datetime('now') WHERE rule_id = ?"
      )
      .run(enabled ? 1 : 0, ruleId);
  }

  /**
   * Delete rule by ID
   */
  deleteRule(ruleId) {
    return this.db.prepare('DELETE FROM security_rules WHERE rule_id = ?').run(ruleId);
  }

  /**
   * Delete rules by source
   */
  deleteRulesBySource(source) {
    return this.db.prepare('DELETE FROM security_rules WHERE source = ?').run(source);
  }

  /**
   * Get rule count by source
   */
  getRuleCountBySource() {
    return this.db
      .prepare('SELECT source, COUNT(*) as count FROM security_rules GROUP BY source')
      .all();
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM security_rules').get().count;
    const enabled = this.db
      .prepare('SELECT COUNT(*) as count FROM security_rules WHERE enabled = 1')
      .get().count;
    const bySource = this.getRuleCountBySource();
    const bySeverity = this.db
      .prepare('SELECT severity, COUNT(*) as count FROM security_rules GROUP BY severity')
      .all();

    return {
      total,
      enabled,
      disabled: total - enabled,
      bySource: Object.fromEntries(bySource.map((r) => [r.source, r.count])),
      bySeverity: Object.fromEntries(bySeverity.map((r) => [r.severity || 'unknown', r.count])),
    };
  }

  // Delegate to RuleSourcesRepository
  getSources() {
    return this._sourcesRepo.getSources();
  }

  getEnabledSources() {
    return this._sourcesRepo.getEnabledSources();
  }

  getSourceByName(name) {
    return this._sourcesRepo.getSourceByName(name);
  }

  upsertSource(source) {
    return this._sourcesRepo.upsertSource(source);
  }

  updateSourceSyncStatus(name, status, ruleCount = null) {
    return this._sourcesRepo.updateSourceSyncStatus(name, status, ruleCount);
  }

  deleteSource(name) {
    const transaction = this.db.transaction(() => {
      const rulesResult = this.deleteRulesBySource(name);
      const sourceResult = this._sourcesRepo.deleteSource(name);
      return { rulesDeleted: rulesResult.changes, sourceDeleted: sourceResult.changes };
    });

    return transaction();
  }

  initializeDefaultSources() {
    return this._sourcesRepo.initializeDefaultSources();
  }
}
