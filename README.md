# 📖 Story Craft

A free, 8-lesson storytelling course that runs entirely on GitHub Pages. Each lesson ends with an
exercise and a small AI writing partner, **MiniCPM5 (1B or 2B)**, running **inside the learner's
browser** via [wllama](https://github.com/ngxson/wllama) (llama.cpp → WebAssembly, WebGPU when available).
No server, no API key, and the learner's writing never leaves their device.

## Lessons
1. What is a story? (character + want + obstacle, dramatic question)
2. The Story Spine (Kenn Adams)
3. Characters: want, need, flaw
4. Promise, progress, payoff; try–fail cycles
5. Story shapes: three acts, Freytag, Story Circle, Kishōtenketsu
6. Building a scene: goal → conflict → disaster (Dwight Swain)
7. Show vs tell, point of view, dialogue with subtext
8. Revise and finish (MICE quotient, final story)

Research notes and sources: [research/storytelling-notes.md](research/storytelling-notes.md)

## Run locally
ES modules need a web server (opening `index.html` as a file will not work):

```bash
python -m http.server 8765
```

Then open http://localhost:8765.

## Models
| Model | Size | Hosted |
|---|---|---|
| MiniCPM5-1B Q4_K_M | 688 MB | This repo (`models/`, split into <100 MB chunks) with Hugging Face fallback |
| MiniCPM5-2B Q4_K_M | 1.56 GB | Hugging Face ([openbmb/MiniCPM5-2B-GGUF](https://huggingface.co/openbmb/MiniCPM5-2B-GGUF)); too big for GitHub Pages' 1 GB limit |

`js/ai.js` tries each URL in order, so the site works before the local chunks are added.

## Project layout
```
index.html          page shell
css/style.css       styles (light + dark)
js/app.js           routing, lesson pages, exercises, progress (localStorage)
js/lessons.js       all course content and AI prompts
js/ai.js            wllama wrapper: load model, stream a reply
vendor/wllama/      wllama 3.6.1 (MIT), vendored so the site has no CDN dependency
models/             split GGUF chunks for the 1B model
```

## Writing prompts for a 1–2B model
Every exercise was tested in the browser on both models. 2B gave usable results on all 8 lessons;
1B is fine for lessons 1–6 and weaker at rewriting (7) and finding evidence (8), so the site recommends 2B.
What works:
- **Prefill** the answer with its first label (`prefill: 'Delivered:'`), and list the labels in the prompt.
  `js/ai.js` builds the MiniCPM5 chat prompt by hand to allow this, including the `<s>` BOS token
  (the model's `add_bos_token` is false; without `<s>` the 1B model produces garbage) and an empty
  `<think></think>` block to turn thinking off.
- A mild repetition penalty (`penalty_repeat: 1.1`) stops label loops.
- Ask small models to **find** things (quote a sentence) rather than **judge** quality: they grade badly.
- Don't describe formatting in words ("in bold", "a colon") and don't leave a blank template at the end:
  both get copied into the answer. No one-shot examples either (1B copies them).

## Credits
Models: [OpenBMB MiniCPM5](https://huggingface.co/openbmb) (Apache-2.0). Runtime: wllama and llama.cpp (MIT).
