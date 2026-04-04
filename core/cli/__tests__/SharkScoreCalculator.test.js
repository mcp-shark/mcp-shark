import assert from 'node:assert';
import { describe, it } from 'node:test';
import { calculateSharkScore, countBySeverity } from '../SharkScoreCalculator.js';

describe('SharkScoreCalculator', () => {
  describe('calculateSharkScore', () => {
    it('returns 100/A for zero findings', () => {
      const result = calculateSharkScore([], []);
      assert.strictEqual(result.score, 100);
      assert.strictEqual(result.grade, 'A');
      assert.strictEqual(result.label, 'Excellent');
    });

    it('deducts 25 per critical finding', () => {
      const findings = [{ severity: 'critical' }, { severity: 'critical' }];
      const result = calculateSharkScore(findings);
      assert.strictEqual(result.score, 50);
      assert.strictEqual(result.grade, 'C');
    });

    it('deducts 15 per high finding', () => {
      const result = calculateSharkScore([{ severity: 'high' }]);
      assert.strictEqual(result.score, 85);
      assert.strictEqual(result.grade, 'B');
    });

    it('deducts 5 per medium finding', () => {
      const result = calculateSharkScore([{ severity: 'medium' }]);
      assert.strictEqual(result.score, 95);
      assert.strictEqual(result.grade, 'A');
    });

    it('deducts 2 per low finding', () => {
      const result = calculateSharkScore([{ severity: 'low' }]);
      assert.strictEqual(result.score, 98);
      assert.strictEqual(result.grade, 'A');
    });

    it('floors at 0, never negative', () => {
      const findings = Array.from({ length: 10 }, () => ({ severity: 'critical' }));
      const result = calculateSharkScore(findings);
      assert.strictEqual(result.score, 0);
      assert.strictEqual(result.grade, 'F');
      assert.strictEqual(result.label, 'Critical risk');
    });

    it('excludes findings with confidence=possible', () => {
      const findings = [{ severity: 'critical', confidence: 'possible' }, { severity: 'high' }];
      const result = calculateSharkScore(findings);
      assert.strictEqual(result.score, 85);
      assert.strictEqual(result.breakdown.confirmedCount, 1);
    });

    it('deducts for toxic flows (HIGH=10, MEDIUM=5, LOW=2)', () => {
      const flows = [{ risk: 'HIGH' }, { risk: 'MEDIUM' }, { risk: 'LOW' }];
      const result = calculateSharkScore([], flows);
      assert.strictEqual(result.score, 83);
      assert.strictEqual(result.breakdown.flowDeductions, 17);
      assert.strictEqual(result.breakdown.flowCount, 3);
    });

    it('combines finding and flow deductions', () => {
      const findings = [{ severity: 'critical' }];
      const flows = [{ risk: 'HIGH' }];
      const result = calculateSharkScore(findings, flows);
      assert.strictEqual(result.score, 65);
    });

    it('returns grade D for score 25-49', () => {
      const findings = [{ severity: 'critical' }, { severity: 'critical' }, { severity: 'high' }];
      const result = calculateSharkScore(findings);
      assert.strictEqual(result.score, 35);
      assert.strictEqual(result.grade, 'D');
    });

    it('provides correct breakdown', () => {
      const findings = [{ severity: 'high' }, { severity: 'medium' }];
      const flows = [{ risk: 'MEDIUM' }];
      const result = calculateSharkScore(findings, flows);
      assert.strictEqual(result.breakdown.findingDeductions, 20);
      assert.strictEqual(result.breakdown.flowDeductions, 5);
      assert.strictEqual(result.breakdown.totalDeductions, 25);
      assert.strictEqual(result.breakdown.confirmedCount, 2);
    });
  });

  describe('countBySeverity', () => {
    it('counts findings by severity', () => {
      const findings = [
        { severity: 'critical' },
        { severity: 'high' },
        { severity: 'high' },
        { severity: 'medium' },
      ];
      const counts = countBySeverity(findings);
      assert.deepStrictEqual(counts, { critical: 1, high: 2, medium: 1, low: 0 });
    });

    it('handles empty array', () => {
      const counts = countBySeverity([]);
      assert.deepStrictEqual(counts, { critical: 0, high: 0, medium: 0, low: 0 });
    });

    it('reads risk_level as fallback', () => {
      const counts = countBySeverity([{ risk_level: 'critical' }]);
      assert.strictEqual(counts.critical, 1);
    });
  });
});
