import { getLlama, resolveModelFile } from 'node-llama-cpp';
import { getModelsDirectory } from '#common/configs';
import { chooseModel } from '#llm/choose-model.js';

function writeJson(obj) {
  process.stdout.write(`${JSON.stringify(obj)}\n`);
}

function parsePayload() {
  try {
    const raw = process.argv[2] || '{}';
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
    return {};
  } catch (_error) {
    return {};
  }
}

async function main() {
  const payload = parsePayload();
  const modelsDirectory = getModelsDirectory();
  const modelName =
    payload.modelMode === 'manual' &&
    typeof payload.modelName === 'string' &&
    payload.modelName.trim()
      ? payload.modelName.trim()
      : chooseModel();

  const modelPath = await resolveModelFile(modelName, modelsDirectory);
  const llama = await getLlama();
  await llama.loadModel({ modelPath });

  writeJson({
    ok: true,
    modelName,
    modelPath,
  });
}

main().catch((error) => {
  writeJson({
    ok: false,
    error: error?.message || String(error),
  });
  process.exit(1);
});
