/**
 * Smart Scan API proxy routes
 * Proxies requests to the Smart Scan API to avoid CORS issues
 */

import * as tokenRoutes from './smartscan/token.js';
import * as discoverRoutes from './smartscan/discover.js';
import * as scanRoutes from './smartscan/scans.js';

export function createSmartScanRoutes() {
  const router = {};

  router.getToken = tokenRoutes.getToken;
  router.saveToken = tokenRoutes.saveToken;
  router.discoverServers = discoverRoutes.discoverServers;
  router.getCachedResults = scanRoutes.getCachedResults;
  router.createScan = scanRoutes.createScan;
  router.getScan = scanRoutes.getScan;
  router.createBatchScans = scanRoutes.createBatchScans;

  return router;
}
