/**
 * Shark Score Calculator
 * Transparent, reproducible scoring formula for MCP security posture
 *
 * Formula: Shark Score = max(0, 100 - Σ finding_weights)
 *
 * Finding weights:
 *   CRITICAL: 25 points
 *   HIGH:     15 points
 *   MEDIUM:    5 points
 *   LOW:       2 points
 *   Toxic flow (HIGH):   10 points
 *   Toxic flow (MEDIUM):  5 points
 *
 * Grades:
 *   90-100  A  Excellent
 *   75-89   B  Good
 *   50-74   C  Needs work
 *   25-49   D  Poor
 *   0-24    F  Critical risk
 */

const FINDING_WEIGHTS = {
  critical: 25,
  high: 15,
  medium: 5,
  low: 2,
};

const TOXIC_FLOW_WEIGHTS = {
  high: 10,
  medium: 5,
  low: 2,
};

const GRADES = [
  { min: 90, grade: 'A', label: 'Excellent' },
  { min: 75, grade: 'B', label: 'Good' },
  { min: 50, grade: 'C', label: 'Needs work' },
  { min: 25, grade: 'D', label: 'Poor' },
  { min: 0, grade: 'F', label: 'Critical risk' },
];

/**
 * Calculate the Shark Score from findings and toxic flows
 * @param {Array} findings - Array of security findings with severity
 * @param {Array} toxicFlows - Array of toxic flow results with risk level
 * @returns {{ score: number, grade: string, label: string, breakdown: object }}
 */
export function calculateSharkScore(findings, toxicFlows = []) {
  const confirmedFindings = findings.filter((f) => f.confidence !== 'possible');

  const findingDeductions = confirmedFindings.reduce((sum, finding) => {
    const severity = (finding.severity || finding.risk_level || '').toLowerCase();
    const weight = FINDING_WEIGHTS[severity] || 0;
    return sum + weight;
  }, 0);

  const flowDeductions = toxicFlows.reduce((sum, flow) => {
    const risk = (flow.risk || '').toLowerCase();
    const weight = TOXIC_FLOW_WEIGHTS[risk] || 0;
    return sum + weight;
  }, 0);

  const totalDeductions = findingDeductions + flowDeductions;
  const score = Math.max(0, 100 - totalDeductions);
  const gradeInfo = getGrade(score);

  return {
    score,
    grade: gradeInfo.grade,
    label: gradeInfo.label,
    breakdown: {
      findingDeductions,
      flowDeductions,
      totalDeductions,
      confirmedCount: confirmedFindings.length,
      flowCount: toxicFlows.length,
    },
  };
}

/**
 * Get grade from score
 */
function getGrade(score) {
  for (const g of GRADES) {
    if (score >= g.min) {
      return g;
    }
  }
  return GRADES[GRADES.length - 1];
}

/**
 * Count findings by severity
 * @param {Array} findings
 * @returns {{ critical: number, high: number, medium: number, low: number }}
 */
export function countBySeverity(findings) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) {
    const severity = (f.severity || f.risk_level || '').toLowerCase();
    if (counts[severity] !== undefined) {
      counts[severity] += 1;
    }
  }
  return counts;
}
