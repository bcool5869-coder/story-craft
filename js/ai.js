// Runs MiniCPM5 in the browser with wllama (llama.cpp compiled to WebAssembly, WebGPU when available).
import { Wllama } from '../vendor/wllama/index.js';

// Everything is served from this repo (GitHub Pages). GitHub rejects files over 100 MB and this model has a
// single 164 MB tensor, so llama-gguf-split can't help: the file is cut into plain 90 MB byte parts
// (`split -b 90M`), re-joined here, and stored once in wllama's browser cache.
export const MODELS = {
  '1b': {
    label: 'MiniCPM5-1B',
    size: '688 MB',
    cacheName: 'story-craft_MiniCPM5-1B-Q4_K_M.gguf',
    bytes: 688065920,
    parts: Array.from({ length: 8 }, (_, i) =>
      new URL(`../models/minicpm5-1b/MiniCPM5-1B-Q4_K_M.gguf.part0${i}`, import.meta.url).href),
  },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Yields a part's bytes, resuming with a Range request if the connection drops.
async function* partBytes(url, onChunk) {
  let offset = 0;
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, offset ? { headers: { Range: `bytes=${offset}-` } } : undefined);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (offset && res.status !== 206) throw new Error('server ignored resume request');
      const reader = res.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) return;
        offset += value.byteLength;
        onChunk(value.byteLength);
        yield value;
      }
    } catch (err) {
      if (attempt >= 5) throw new Error(`Download failed: ${err.message}. Check your connection and try again.`);
      await sleep(1000 * (attempt + 1));
    }
  }
}

// Streams all parts in order into the cache, then returns the joined file.
async function openCachedModel(cache, model, onProgress) {
  const cached = await cache.open(model.cacheName);
  if (cached && cached.size === model.bytes) return cached;

  let loaded = 0;
  const bytes = (async function* () {
    for (const url of model.parts) {
      yield* partBytes(url, (n) => { loaded += n; onProgress?.(loaded / model.bytes); });
    }
  })();
  const joined = new ReadableStream({
    async pull(controller) {
      const { done, value } = await bytes.next();
      if (done) controller.close(); else controller.enqueue(value);
    },
  });
  await cache.write(model.cacheName, joined, {
    etag: model.cacheName, originalSize: model.bytes, originalURL: model.parts[0],
  });
  const blob = await cache.open(model.cacheName);
  if (!blob || blob.size !== model.bytes) {
    await cache.delete(model.cacheName);
    throw new Error('Model download was incomplete. Please try again.');
  }
  return blob;
}

let wllama = null;
let loadedKey = null;

export const isLoaded = () => loadedKey !== null;
export const loadedModel = () => (loadedKey ? MODELS[loadedKey] : null);
export const hasWebGPU = () => 'gpu' in navigator;

export async function loadModel(key, onProgress) {
  if (loadedKey === key) return;
  if (wllama) await wllama.exit();
  loadedKey = null;
  wllama = new Wllama({ default: new URL('../vendor/wllama/wasm/wllama.wasm', import.meta.url).href });
  const blob = await openCachedModel(wllama.cacheManager, MODELS[key], onProgress);
  onProgress?.(1);
  await wllama.loadModel([blob], { n_ctx: 4096, jinja: true });
  loadedKey = key;
}

// MiniCPM5 chat format with thinking disabled (same as its chat template with enable_thinking=false).
// Built by hand so the assistant reply can be prefilled: small models follow a started answer
// far better than a described format.
// The template adds the BOS token "<s>" itself (add_bos_token is false), so the raw prompt must too.
const chatPrompt = (system, user, prefill) =>
  `<s><|im_start|>system\n${system}<|im_end|>\n<|im_start|>user\n${user}<|im_end|>\n` +
  `<|im_start|>assistant\n<think>\n\n</think>\n\n${prefill}`;

// Streams a reply. onToken receives each new piece of text and the full text so far (including prefill).
export async function generate({ system, user, prefill = '', maxTokens = 400, onToken, signal }) {
  if (!wllama || !loadedKey) throw new Error('Load a model first.');
  const stream = await wllama.createCompletion({
    prompt: chatPrompt(system, user, prefill),
    max_tokens: maxTokens,
    temperature: 0.7,
    top_p: 0.95,
    penalty_repeat: 1.1, // small models can loop on a label
    penalty_last_n: 128,
    stop: ['<|im_end|>'],
    stream: true,
    abortSignal: signal,
  });
  let text = prefill;
  if (prefill) onToken?.(prefill, text);
  for await (const chunk of stream) {
    const piece = chunk.choices[0]?.text ?? '';
    if (piece) {
      text += piece;
      onToken?.(piece, text);
    }
  }
  return text;
}
