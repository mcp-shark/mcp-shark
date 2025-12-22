/**
 * Smart Scan endpoints - Aggregates all Smart Scan path definitions
 */

import { discoveryPaths } from './discovery.js';
import { scansPaths } from './scans.js';
import { tokenPaths } from './token.js';

export const smartScanPaths = {
  ...scansPaths,
  ...tokenPaths,
  ...discoveryPaths,
};
