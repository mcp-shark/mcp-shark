/**
 * Smoke tests for shipped JS scan modules (see rules/index.js).
 * Declarative / OWASP-pack rules are covered under core/cli DeclarativeRuleEngine tests.
 */
import assert from 'node:assert';
import { describe, it } from 'node:test';

import * as agentic05RCE from '../scans/agentic05RCE.js';
import * as commandInjection from '../scans/commandInjection.js';
import * as configPermissions from '../scans/configPermissions.js';
import * as crossServerShadowing from '../scans/crossServerShadowing.js';
import * as duplicateToolNames from '../scans/duplicateToolNames.js';
import * as insecureTransport from '../scans/insecureTransport.js';
import * as mcp05CommandInjection from '../scans/mcp05CommandInjection.js';
import * as missingContainment from '../scans/missingContainment.js';
import * as shellEnvInjection from '../scans/shellEnvInjection.js';
import * as toolNameAmbiguity from '../scans/toolNameAmbiguity.js';
import * as unsafeDefaults from '../scans/unsafeDefaults.js';

const SCAN_MODULES = [
  agentic05RCE,
  commandInjection,
  configPermissions,
  crossServerShadowing,
  duplicateToolNames,
  insecureTransport,
  mcp05CommandInjection,
  missingContainment,
  shellEnvInjection,
  toolNameAmbiguity,
  unsafeDefaults,
];

describe('rules/scans (shipped)', () => {
  for (const mod of SCAN_MODULES) {
    const id = mod.ruleMetadata?.id || '(missing id)';
    it(`${id} exports metadata and analyzer surface`, () => {
      assert.ok(mod.ruleMetadata?.id);
      assert.ok(mod.ruleMetadata?.name);
      assert.ok(typeof mod.analyzeTool === 'function');
      assert.ok(typeof mod.analyzePrompt === 'function');
      assert.ok(typeof mod.analyzeResource === 'function');
      assert.ok(typeof mod.analyzePacket === 'function');
    });
  }

  describe('insecureTransport', () => {
    it('flags remote HTTP server URLs', () => {
      const findings = insecureTransport.analyzeServerTransport('remote', {
        url: 'http://api.example.com/mcp',
      });
      assert.ok(findings.length > 0);
    });

    it('allows localhost HTTP', () => {
      const findings = insecureTransport.analyzeServerTransport('local', {
        url: 'http://localhost:8080/mcp',
      });
      assert.strictEqual(findings.length, 0);
    });

    it('does not treat localhost.evil.com as localhost', () => {
      const findings = insecureTransport.analyzeServerTransport('trap', {
        url: 'http://localhost.evil.com/mcp',
      });
      assert.ok(findings.length > 0);
    });
  });
});
