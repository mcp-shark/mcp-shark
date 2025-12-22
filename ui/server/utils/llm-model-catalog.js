export function getModelCatalog() {
  return [
    {
      id: 'qwen2.5-1.5b-instruct-q4_k_m',
      name: 'Qwen2.5 1.5B Instruct (Q4_K_M)',
      fileName: 'Qwen2.5-1.5B-Instruct-Q4_K_M.gguf',
      source: 'huggingface',
      url: 'https://huggingface.co/bartowski/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/Qwen2.5-1.5B-Instruct-Q4_K_M.gguf?download=true',
      notes:
        'Small, fast, good default for drift analysis on 8GB+ machines. If download fails, visit the Hugging Face repository to verify the URL.',
      repositoryUrl: 'https://huggingface.co/bartowski/Qwen2.5-1.5B-Instruct-GGUF',
    },
  ];
}
