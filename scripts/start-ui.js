#!/usr/bin/env node
import { runUIServer } from '../ui/server.js';

// Run the server directly
runUIServer().catch((err) => {
  console.error('Failed to start UI server:', err);
  process.exit(1);
});
