import { createWriteStream, existsSync, mkdirSync, renameSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { getModelsDirectory } from '#common/configs';

const downloadState = {
  current: null,
};

function safeFileName(input) {
  const name = String(input || '').trim();
  const sanitized = name.replace(/[^\w.\-+() ]/g, '_').slice(0, 200);
  if (!sanitized) {
    return null;
  }
  return sanitized;
}

function parseContentLength(headers) {
  const value = headers.get('content-length');
  if (!value) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function getModelDownloadStatus() {
  if (!downloadState.current) {
    return { running: false };
  }

  const current = downloadState.current;
  const totalBytes = current.totalBytes;
  const downloadedBytes = current.downloadedBytes;
  const percent =
    typeof totalBytes === 'number' && totalBytes > 0
      ? Math.round((downloadedBytes / totalBytes) * 1000) / 10
      : null;

  return {
    running: true,
    id: current.id,
    fileName: current.fileName,
    url: current.url,
    startedAt: current.startedAt,
    downloadedBytes,
    totalBytes,
    percent,
    error: current.error,
    done: current.done,
    cancelled: current.cancelled,
    targetPath: current.targetPath,
  };
}

export function cancelModelDownload() {
  if (!downloadState.current) {
    return { cancelled: false };
  }
  downloadState.current.cancelled = true;
  downloadState.current.controller.abort();
  return { cancelled: true };
}

export async function startModelDownload({ url, fileName }) {
  if (downloadState.current && !downloadState.current.done) {
    throw new Error('A model download is already in progress');
  }

  const modelsDirectory = getModelsDirectory();
  if (!existsSync(modelsDirectory)) {
    mkdirSync(modelsDirectory, { recursive: true });
  }

  const resolvedUrl = String(url || '').trim();
  if (!resolvedUrl) {
    throw new Error('Model URL is required');
  }

  const resolvedFileName = safeFileName(fileName);
  if (!resolvedFileName) {
    throw new Error('fileName is required');
  }

  const controller = new AbortController();
  const state = {
    id: `${Date.now()}`,
    url: resolvedUrl,
    fileName: resolvedFileName,
    startedAt: Date.now(),
    downloadedBytes: 0,
    totalBytes: null,
    error: null,
    done: false,
    cancelled: false,
    controller,
    targetPath: join(modelsDirectory, resolvedFileName),
    tempPath: join(modelsDirectory, `${resolvedFileName}.part`),
  };
  downloadState.current = state;

  try {
    const res = await fetch(resolvedUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        // Hugging Face may apply bot/WAF rules differently depending on headers.
        // Using a browser-like UA improves reliability for direct file downloads.
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        accept: '*/*',
      },
    });
    if (!res.ok) {
      let errorMsg = `Download failed: HTTP ${res.status}`;
      if (res.status === 404) {
        errorMsg +=
          '. The file may not exist at this URL. Please verify the URL is correct and points to a direct download link.';
        if (resolvedUrl.includes('huggingface.co')) {
          errorMsg +=
            ' For Hugging Face models, ensure you use the "/resolve/main/" path, not "/blob/main/".';
        }
      } else if (res.status === 403) {
        errorMsg +=
          '. Access denied. The file may require authentication or the URL may be incorrect.';
      }
      throw new Error(errorMsg);
    }
    if (!res.body) {
      throw new Error('Download failed: empty response body');
    }

    state.totalBytes = parseContentLength(res.headers);

    const bodyStream = Readable.fromWeb(res.body);
    const out = createWriteStream(state.tempPath);

    bodyStream.on('data', (chunk) => {
      state.downloadedBytes += chunk.length;
    });

    bodyStream.pipe(out);
    await Promise.all([finished(out), finished(bodyStream)]);

    if (state.cancelled) {
      throw new Error('Download cancelled');
    }

    renameSync(state.tempPath, state.targetPath);
    state.done = true;
    return getModelDownloadStatus();
  } catch (error) {
    state.error = error?.message || String(error);
    state.done = true;
    try {
      if (existsSync(state.tempPath)) {
        unlinkSync(state.tempPath);
      }
    } catch (_err) {
      // ignore cleanup errors
    }
    throw error;
  }
}
