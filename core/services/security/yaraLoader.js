/**
 * YARA Module Loader
 * Attempts to load the optional @automattic/yara package at module initialization.
 * Exports null if the package is not available.
 */

const yaraModule = await import('@automattic/yara').catch(() => null);

export default yaraModule;
