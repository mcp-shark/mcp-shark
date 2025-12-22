## Phase: Local LLM Settings + Guardrails

**Status:** ✅ Completed  
**Last Updated:** 2025-12-17

### Sub-phases
- ✅ Persist Local LLM settings (`llm-settings.json`) under `~/.mcp-shark/`
- ✅ Settings API: expose + update LLM settings and model discovery
- ✅ UI: Local LLM settings section in **MCP Server Setup**
- ✅ Guardrails: RAM threshold, cooldown, single-flight test runner, clear error messages
- ✅ Docs updates

### Completed items
- Added persisted Local LLM settings with normalization/clamping and safe defaults
- Extended `GET /api/settings` to include:
  - LLM settings + recommended model
  - detected `.gguf` models in `~/.mcp-shark/models`
  - system memory info
  - runtime flags (whether `node-llama-cpp` is installed)
- Added endpoints:
  - `POST /api/settings/llm` to update persisted Local LLM settings
  - `POST /api/settings/llm/test` to validate that a model can load (runs in a subprocess)
- Added a new UI section to configure and warn about resource usage
 - Refactored the Local LLM settings UI into smaller modules to comply with frontend file size limits
 - Split `lib/common/configs/index.js` into smaller modules to comply with backend file size limits
 - Added interactive setup:
   - dependency install runner (npm) with progress/cancel
   - model downloader with progress/cancel

### Files created
- `docs/PHASE_LLM_SETTINGS_PROGRESS.md`
- `lib/llm/test-load-child.js`
- `ui/server/utils/llm-test.js`
- `ui/server/utils/llm-runtime.js`
- `ui/server/utils/settings.js`
- `ui/src/components/LlmSettings/LlmSettingsSection.jsx`
- `ui/src/components/LlmSettings/LlmSettingsUi.jsx`
- `ui/src/components/LlmSettings/LlmPerformanceCaps.jsx`
- `ui/src/components/LlmSettings/LlmSettingsActions.jsx`
- `ui/src/components/LlmSettings/defaultLlmSettings.js`
- `ui/src/components/LlmSettings/LlmDependencyInstaller.jsx`
- `ui/src/components/LlmSettings/LlmModelDownloader.jsx`
- `ui/src/components/LlmSettings/index.js`
- `lib/common/configs/paths.js`
- `lib/common/configs/help-state.js`
- `lib/common/configs/llm-settings.js`
- `ui/server/routes/llm.js`
- `ui/server/utils/repo-root.js`
- `ui/server/utils/llm-deps-install.js`
- `ui/server/utils/llm-model-download.js`
- `ui/server/utils/llm-model-catalog.js`

### Files modified
- `lib/common/configs/index.js`
- `lib/llm/choose-model.js`
- `ui/server.js`
- `ui/server/routes/settings.js`
- `ui/src/CompositeSetup.jsx`
- `docs/api-reference.md`
- `docs/configuration.md`

### Next steps (optional)
- Integrate these settings into the actual tool drift analyzer (run LLM only when enabled and within caps)
- Add UI visibility for model download/install workflow (if you want to distribute models)


