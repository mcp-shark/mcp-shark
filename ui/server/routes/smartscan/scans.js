import * as createScanRoute from './scans/createScan.js';
import * as getScanRoute from './scans/getScan.js';
import * as getCachedResultsRoute from './scans/getCachedResults.js';
import * as createBatchScansRoute from './scans/createBatchScans.js';
import * as listScansRoute from './scans/listScans.js';
import * as clearCacheRoute from './scans/clearCache.js';

export const createScan = createScanRoute.createScan;
export const getScan = getScanRoute.getScan;
export const getCachedResults = getCachedResultsRoute.getCachedResults;
export const createBatchScans = createBatchScansRoute.createBatchScans;
export const listScans = listScansRoute.listScans;
export const clearCache = clearCacheRoute.clearCache;
