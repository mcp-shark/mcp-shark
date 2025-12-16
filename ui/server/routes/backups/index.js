import { deleteBackup } from './deleteBackup.js';
import { listBackups } from './listBackups.js';
import { restoreBackup } from './restoreBackup.js';
import { viewBackup } from './viewBackup.js';

export function createBackupRoutes() {
  const router = {};

  router.listBackups = listBackups;
  router.restoreBackup = restoreBackup;
  router.viewBackup = viewBackup;
  router.deleteBackup = deleteBackup;

  return router;
}
