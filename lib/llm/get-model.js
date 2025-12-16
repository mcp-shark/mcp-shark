import { getLlama, resolveModelFile } from 'node-llama-cpp';
import { getModelsDirectory, logger } from '#common/configs';

export async function getModel(modelName) {
  logger.info(`Getting model ${modelName}`);
  const modelsDirectory = getModelsDirectory();
  logger.info(`Models directory: ${modelsDirectory}`);
  const modelPath = await resolveModelFile(modelName, modelsDirectory);
  logger.info(`Model path: ${modelPath}`);
  const llama = await getLlama();
  logger.info('Llama instance created');
  const model = await llama.loadModel({ modelPath });
  logger.info(`Model ${modelName} loaded`);
  return model;
}
