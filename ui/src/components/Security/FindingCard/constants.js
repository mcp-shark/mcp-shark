import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCode,
  IconInfoCircle,
  IconNetwork,
  IconServer,
  IconTool,
} from '@tabler/icons-react';
import { colors } from '../../../theme.js';

export const SEVERITY_CONFIG = {
  critical: { color: colors.error, icon: IconAlertCircle, label: 'Critical' },
  high: { color: '#ea580c', icon: IconAlertTriangle, label: 'High' },
  medium: { color: '#b45309', icon: IconAlertTriangle, label: 'Medium' },
  low: { color: '#0d9488', icon: IconInfoCircle, label: 'Low' }, // Teal
  info: { color: colors.textTertiary, icon: IconInfoCircle, label: 'Info' },
};

export const TARGET_ICONS = {
  tool: IconTool,
  prompt: IconCode,
  resource: IconServer,
  server: IconServer,
  packet: IconNetwork,
};

/**
 * Parse description to extract detected patterns
 * Format: "Command-like sequences detected: pattern1, pattern2, pattern3..."
 */
export function parseDetectedPatterns(description) {
  if (!description) return { summary: null, patterns: [] };

  const prefixes = [/detected:\s*/i, /patterns?:\s*/i, /found:\s*/i, /matches?:\s*/i];

  for (const prefix of prefixes) {
    const match = description.match(prefix);
    if (match) {
      const afterPattern = description.substring(match.index + match[0].length);
      const jsonStart = afterPattern.search(/[{\[]/);
      const patternsPart = jsonStart > 0 ? afterPattern.substring(0, jsonStart) : afterPattern;

      const patterns = patternsPart
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p && p.length < 100 && !p.includes('"type"'));

      if (patterns.length > 0) {
        const summaryMatch = description.match(/^([^:]+):/);
        const summary = summaryMatch ? summaryMatch[1].trim() : null;
        return { summary, patterns };
      }
    }
  }

  if (description.length < 200 && !description.includes('{')) {
    return { summary: description, patterns: [] };
  }

  return { summary: null, patterns: [] };
}

/**
 * Format evidence - try to pretty print JSON or show as code
 */
export function formatEvidence(evidence) {
  if (!evidence) return null;

  try {
    const parsed = JSON.parse(evidence);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return evidence;
  }
}
