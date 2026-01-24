/**
 * Repository for security findings operations
 * Handles storage and retrieval of security scan results
 * Note: Schema is managed by SchemaRepository - table created with IF NOT EXISTS
 * for backward compatibility with older databases
 */
export class SecurityFindingsRepository {
  constructor(db) {
    this.db = db;
  }

  /**
   * Insert a single finding
   */
  insertFinding(finding) {
    const stmt = this.db.prepare(`
      INSERT INTO security_findings (
        rule_id,
        finding_type,
        target_type,
        target_name,
        server_name,
        session_id,
        frame_number,
        severity,
        owasp_id,
        title,
        description,
        evidence,
        recommendation,
        scan_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      finding.rule_id,
      finding.finding_type,
      finding.target_type,
      finding.target_name || null,
      finding.server_name || null,
      finding.session_id || null,
      finding.frame_number || null,
      finding.severity,
      finding.owasp_id || null,
      finding.title,
      finding.description || null,
      finding.evidence || null,
      finding.recommendation || null,
      finding.scan_id || null
    );

    return result.lastInsertRowid;
  }

  /**
   * Insert multiple findings in a transaction
   */
  insertFindings(findings, scanId = null) {
    const stmt = this.db.prepare(`
      INSERT INTO security_findings (
        rule_id,
        finding_type,
        target_type,
        target_name,
        server_name,
        session_id,
        frame_number,
        severity,
        owasp_id,
        title,
        description,
        evidence,
        recommendation,
        scan_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((items) => {
      const ids = [];
      for (const finding of items) {
        const result = stmt.run(
          finding.rule_id,
          finding.finding_type,
          finding.target_type,
          finding.target_name || null,
          finding.server_name || null,
          finding.session_id || null,
          finding.frame_number || null,
          finding.severity,
          finding.owasp_id || null,
          finding.title,
          finding.description || null,
          finding.evidence || null,
          finding.recommendation || null,
          scanId || finding.scan_id || null
        );
        ids.push(result.lastInsertRowid);
      }
      return ids;
    });

    return insertMany(findings);
  }

  /**
   * Get all findings with optional filters
   */
  getFindings(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.severity) {
      conditions.push('severity = ?');
      params.push(filters.severity);
    }

    if (filters.owasp_id) {
      conditions.push('owasp_id = ?');
      params.push(filters.owasp_id);
    }

    if (filters.server_name) {
      conditions.push('server_name = ?');
      params.push(filters.server_name);
    }

    if (filters.finding_type) {
      conditions.push('finding_type = ?');
      params.push(filters.finding_type);
    }

    if (filters.scan_id) {
      conditions.push('scan_id = ?');
      params.push(filters.scan_id);
    }

    if (filters.rule_id) {
      conditions.push('rule_id = ?');
      params.push(filters.rule_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    const sql = `
      SELECT * FROM security_findings
      ${whereClause}
      ORDER BY 
        CASE severity
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          WHEN 'info' THEN 5
        END,
        created_at DESC
      LIMIT ? OFFSET ?
    `;

    return this.db.prepare(sql).all(...params, limit, offset);
  }

  /**
   * Get finding by ID
   */
  getFindingById(id) {
    return this.db.prepare('SELECT * FROM security_findings WHERE id = ?').get(id);
  }

  /**
   * Get findings count by filters
   */
  getFindingsCount(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.severity) {
      conditions.push('severity = ?');
      params.push(filters.severity);
    }

    if (filters.owasp_id) {
      conditions.push('owasp_id = ?');
      params.push(filters.owasp_id);
    }

    if (filters.server_name) {
      conditions.push('server_name = ?');
      params.push(filters.server_name);
    }

    if (filters.finding_type) {
      conditions.push('finding_type = ?');
      params.push(filters.finding_type);
    }

    if (filters.scan_id) {
      conditions.push('scan_id = ?');
      params.push(filters.scan_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `SELECT COUNT(*) as count FROM security_findings ${whereClause}`;
    return this.db.prepare(sql).get(...params).count;
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const bySeverity = this.db
      .prepare(
        `
      SELECT severity, COUNT(*) as count
      FROM security_findings
      GROUP BY severity
    `
      )
      .all();

    const byOwasp = this.db
      .prepare(
        `
      SELECT owasp_id, COUNT(*) as count
      FROM security_findings
      WHERE owasp_id IS NOT NULL
      GROUP BY owasp_id
    `
      )
      .all();

    const byServer = this.db
      .prepare(
        `
      SELECT server_name, COUNT(*) as count
      FROM security_findings
      WHERE server_name IS NOT NULL
      GROUP BY server_name
    `
      )
      .all();

    const byType = this.db
      .prepare(
        `
      SELECT finding_type, COUNT(*) as count
      FROM security_findings
      GROUP BY finding_type
    `
      )
      .all();

    const total = this.db.prepare('SELECT COUNT(*) as count FROM security_findings').get().count;

    return {
      total,
      bySeverity: Object.fromEntries(bySeverity.map((r) => [r.severity, r.count])),
      byOwasp: Object.fromEntries(byOwasp.map((r) => [r.owasp_id, r.count])),
      byServer: Object.fromEntries(byServer.map((r) => [r.server_name, r.count])),
      byType: Object.fromEntries(byType.map((r) => [r.finding_type, r.count])),
    };
  }

  /**
   * Delete findings by scan ID
   */
  deleteFindingsByScanId(scanId) {
    return this.db.prepare('DELETE FROM security_findings WHERE scan_id = ?').run(scanId).changes;
  }

  /**
   * Delete all findings
   */
  deleteAllFindings() {
    return this.db.prepare('DELETE FROM security_findings').run().changes;
  }

  /**
   * Delete findings older than a given date
   */
  deleteFindingsOlderThan(dateString) {
    return this.db.prepare('DELETE FROM security_findings WHERE created_at < ?').run(dateString)
      .changes;
  }
}
