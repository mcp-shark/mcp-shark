import os from 'node:os';

const platform = process.platform;
const arch = process.arch;
const ramGB = os.totalmem() / 1024 ** 3;

const MODELS = {
  lily: { name: 'lily-cybersecurity-7b-v0.2-q4_k_m.gguf', ramLimit: 16 },
  qwen: { name: 'Qwen2.5-1.5B-Instruct-Q4_K_M.gguf', ramLimit: 8 },
};

export function chooseModel() {
  logger.info(`Choosing model for platform: ${platform}`);
  logger.info(`Choosing model for architecture: ${arch}`);
  logger.info(`Choosing model for RAM: ${ramGB}GB`);

  if (ramGB >= MODELS.lily.ramLimit) {
    return MODELS.lily.name;
  }

  return MODELS.qwen.name;
}
