// Runs MiniCPM5 in the browser with wllama (llama.cpp compiled to WebAssembly, WebGPU when available).
import { Wllama } from '../vendor/wllama/index.js';

const HF = 'https://huggingface.co/openbmb';

export const MODELS = {
  '2b': {
    label: 'MiniCPM5-2B',
    size: '1.56 GB',
    urls: [`${HF}/MiniCPM5-2B-GGUF/resolve/main/MiniCPM5-2B-Q4_K_M.gguf`],
  },
  '1b': {
    label: 'MiniCPM5-1B',
    size: '688 MB',
    // First URL that exists wins: split chunks committed to this repo, then Hugging Face.
    urls: [
      './models/minicpm5-1b/MiniCPM5-1B-Q4_K_M-00001-of-00008.gguf',
      `${HF}/MiniCPM5-1B-GGUF/resolve/main/MiniCPM5-1B-Q4_K_M.gguf`,
    ],
  },
};

let wllama = null;
let loadedKey = null;

export const isLoaded = () => loadedKey !== null;
export const loadedModel = () => (loadedKey ? MODELS[loadedKey] : null);
export const hasWebGPU = () => 'gpu' in navigator;

// Probes every URL except the last, which is used as-is (no HEAD request to the external host).
async function firstReachable(urls) {
  for (const url of urls.slice(0, -1)) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) return url;
    } catch { /* try next */ }
  }
  return urls[urls.length - 1];
}

export async function loadModel(key, onProgress) {
  if (loadedKey === key) return;
  if (wllama) await wllama.exit();
  loadedKey = null;
  wllama = new Wllama({ default: new URL('../vendor/wllama/wasm/wllama.wasm', import.meta.url).href });
  const url = await firstReachable(MODELS[key].urls);
  await wllama.loadModelFromUrl(url, {
    n_ctx: 4096,
    jinja: true,
    progressCallback: ({ loaded, total }) => onProgress?.(total ? loaded / total : 0),
  });
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
