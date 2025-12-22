/**
 * Compute deterministic diff between two normalized tool manifests
 * Returns structured diff with added/removed/changed tools
 */
export function computeToolManifestDiff(baseline, current) {
  if (!baseline || !current) {
    return {
      added: [],
      removed: [],
      changed: [],
      summary: 'Invalid baseline or current manifest',
    };
  }

  const baselineTools = new Map();
  const currentTools = new Map();

  if (Array.isArray(baseline.tools)) {
    for (const tool of baseline.tools) {
      if (tool?.name) {
        baselineTools.set(tool.name, tool);
      }
    }
  }

  if (Array.isArray(current.tools)) {
    for (const tool of current.tools) {
      if (tool?.name) {
        currentTools.set(tool.name, tool);
      }
    }
  }

  const added = [];
  const removed = [];
  const changed = [];

  for (const [name, currentTool] of currentTools) {
    if (!baselineTools.has(name)) {
      added.push({
        name,
        description: currentTool.description || '',
        inputSchemaHash: currentTool.inputSchemaHash || null,
      });
    } else {
      const baselineTool = baselineTools.get(name);
      const toolChanged = hasToolChanged(baselineTool, currentTool);
      if (toolChanged) {
        changed.push({
          name,
          changes: detectToolChanges(baselineTool, currentTool),
        });
      }
    }
  }

  for (const [name, baselineTool] of baselineTools) {
    if (!currentTools.has(name)) {
      removed.push({
        name,
        description: baselineTool.description || '',
        inputSchemaHash: baselineTool.inputSchemaHash || null,
      });
    }
  }

  const summary = buildDiffSummary(added, removed, changed);

  return {
    added,
    removed,
    changed,
    summary,
  };
}

function hasToolChanged(baseline, current) {
  if (baseline.description !== current.description) {
    return true;
  }

  const baselineSchema = JSON.stringify(baseline.inputSchema || {});
  const currentSchema = JSON.stringify(current.inputSchema || {});
  return baselineSchema !== currentSchema;
}

function detectToolChanges(baseline, current) {
  const changes = [];

  if (baseline.description !== current.description) {
    changes.push('description');
  }

  const baselineSchema = JSON.stringify(baseline.inputSchema || {});
  const currentSchema = JSON.stringify(current.inputSchema || {});
  if (baselineSchema !== currentSchema) {
    changes.push('inputSchema');
  }

  return changes;
}

function buildDiffSummary(added, removed, changed) {
  const parts = [];

  if (added.length > 0) {
    parts.push(`${added.length} tool${added.length === 1 ? '' : 's'} added`);
  }

  if (removed.length > 0) {
    parts.push(`${removed.length} tool${removed.length === 1 ? '' : 's'} removed`);
  }

  if (changed.length > 0) {
    parts.push(`${changed.length} tool${changed.length === 1 ? '' : 's'} changed`);
  }

  if (parts.length === 0) {
    return 'No changes detected';
  }

  return parts.join(', ');
}

/**
 * Compute deterministic severity based on diff
 */
export function computeDeterministicSeverity(diff) {
  if (!diff) {
    return 'low';
  }

  const { added, removed, changed } = diff;
  const totalChanges = added.length + removed.length + changed.length;

  if (totalChanges === 0) {
    return 'low';
  }

  const hasExecTools = (tools) => {
    return tools.some((t) => {
      const name = String(t.name || '').toLowerCase();
      return (
        name.includes('exec') ||
        name.includes('run') ||
        name.includes('command') ||
        name.includes('shell') ||
        name.includes('system')
      );
    });
  };

  const hasFileSystemTools = (tools) => {
    return tools.some((t) => {
      const name = String(t.name || '').toLowerCase();
      return (
        name.includes('file') ||
        name.includes('write') ||
        name.includes('delete') ||
        name.includes('create') ||
        name.includes('fs')
      );
    });
  };

  const hasNetworkTools = (tools) => {
    return tools.some((t) => {
      const name = String(t.name || '').toLowerCase();
      return (
        name.includes('http') ||
        name.includes('fetch') ||
        name.includes('request') ||
        name.includes('network')
      );
    });
  };

  if (hasExecTools(added) || hasFileSystemTools(added) || hasNetworkTools(added)) {
    return 'critical';
  }

  if (removed.length > 5 || added.length > 10) {
    return 'high';
  }

  if (removed.length > 0 || added.length > 3 || changed.length > 5) {
    return 'medium';
  }

  return 'low';
}
