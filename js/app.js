import { LESSONS } from './lessons.js';
import * as ai from './ai.js';

const $ = (sel, root = document) => root.querySelector(sel);
const main = $('#main');

// ---------- storage (per-browser convenience only) ----------
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem('story:' + key); return v === null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('story:' + key, JSON.stringify(value)); } catch { /* ignore */ }
  },
};

const lessonDone = (l) => {
  const checks = store.get(`checks:${l.id}`, []);
  return l.checklist.every((_, i) => checks[i]);
};

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const c of children) if (c != null) node.append(c);
  return node;
}

// ---------- model panel ----------
const dialog = $('#model-dialog');
const statusBtn = $('#ai-status');
let loading = false;

function renderStatus() {
  const m = ai.loadedModel();
  statusBtn.textContent = loading ? 'AI: loading…' : m ? `AI: ${m.label} ready` : 'AI: not loaded';
  statusBtn.classList.toggle('ready', !!m);
}

function openModelDialog() {
  const body = $('#model-options', dialog);
  body.replaceChildren();
  body.append(el('p', { class: 'muted' },
    ai.hasWebGPU()
      ? 'WebGPU detected: the model will run on your graphics card.'
      : 'WebGPU not available: the model will run on your CPU (slower). Chrome or Edge on desktop works best.'));
  for (const [key, m] of Object.entries(ai.MODELS)) {
    body.append(el('button', {
      class: 'model-option', type: 'button',
      onclick: () => startLoad(key),
    },
      el('strong', {}, m.label),
      el('span', {}, `${m.size} download, cached after the first time`),
      el('span', { class: 'muted' }, 'A small 1B model. Strongest on lessons 1–6; treat its rewrites and feedback as rough ideas.')));
  }
  body.append(el('div', { class: 'progress', hidden: '' }, el('div', { class: 'bar' })), el('p', { class: 'load-msg muted' }));
  if (!dialog.open) dialog.showModal();
}

async function startLoad(key) {
  if (loading) return;
  loading = true;
  renderStatus();
  const progress = $('.progress', dialog), bar = $('.bar', dialog), msg = $('.load-msg', dialog);
  dialog.querySelectorAll('.model-option').forEach((b) => (b.disabled = true));
  progress.hidden = false;
  msg.textContent = 'Downloading…';
  try {
    await ai.loadModel(key, (p) => {
      bar.style.width = `${Math.round(p * 100)}%`;
      msg.textContent = p < 1 ? `Downloading… ${Math.round(p * 100)}%` : 'Starting the model…';
    });
    msg.textContent = 'Ready!';
    setTimeout(() => dialog.close(), 600);
  } catch (err) {
    console.error(err);
    msg.textContent = `Could not load the model: ${err.message}`;
  } finally {
    loading = false;
    dialog.querySelectorAll('.model-option').forEach((b) => (b.disabled = false));
    renderStatus();
  }
}

statusBtn.addEventListener('click', openModelDialog);
$('#model-close').addEventListener('click', () => dialog.close());

// ---------- pages ----------
function renderHome() {
  document.title = 'Story Craft: a storytelling course';
  const done = LESSONS.filter(lessonDone).length;
  main.replaceChildren(
    el('section', { class: 'hero' },
      el('h1', {}, 'Learn to tell stories'),
      el('p', { class: 'lede' },
        '8 short lessons on character, structure, scenes and style. Each lesson ends with an exercise and a small AI writing partner that runs entirely in your browser: no account, no server, your writing never leaves your device.'),
      el('p', { class: 'muted' }, `${done} of ${LESSONS.length} lessons complete`)),
    el('ol', { class: 'lesson-list' },
      ...LESSONS.map((l) => el('li', {},
        el('a', { href: `#/lesson/${l.id}`, class: lessonDone(l) ? 'done' : '' },
          el('span', { class: 'num' }, String(l.id)),
          el('span', { class: 'title' }, l.title),
          el('span', { class: 'meta' }, lessonDone(l) ? '✓ done' : `${l.minutes} min`))))),
  );
}

function renderLesson(lesson) {
  document.title = `${lesson.id}. ${lesson.title}: Story Craft`;
  const prev = LESSONS.find((l) => l.id === lesson.id - 1);
  const next = LESSONS.find((l) => l.id === lesson.id + 1);

  const content = el('div', { class: 'prose' });
  content.innerHTML = lesson.body; // trusted, authored content

  const checks = store.get(`checks:${lesson.id}`, []);
  const checklist = el('ul', { class: 'checklist' },
    ...lesson.checklist.map((text, i) => {
      const box = el('input', { type: 'checkbox', id: `chk-${i}` });
      box.checked = !!checks[i];
      box.addEventListener('change', () => { checks[i] = box.checked; store.set(`checks:${lesson.id}`, checks); });
      return el('li', {}, box, el('label', { for: `chk-${i}` }, text));
    }));

  main.replaceChildren(
    el('nav', { class: 'crumbs' }, el('a', { href: '#/' }, '← All lessons')),
    el('article', {},
      el('p', { class: 'eyebrow' }, `Lesson ${lesson.id} · ${lesson.minutes} min`),
      el('h1', {}, lesson.title),
      content,
      renderExercise(lesson),
      el('section', { class: 'card' }, el('h2', {}, 'Checklist'), checklist)),
    el('nav', { class: 'pager' },
      prev ? el('a', { href: `#/lesson/${prev.id}` }, `← ${prev.title}`) : el('span'),
      next ? el('a', { href: `#/lesson/${next.id}` }, `${next.title} →`) : el('a', { href: '#/' }, 'Finish →')),
  );
  window.scrollTo(0, 0);
}

function renderExercise(lesson) {
  const ex = lesson.exercise;
  const saved = store.get(`fields:${lesson.id}`, {});
  const inputs = {};

  const fields = ex.fields.map((f) => {
    let input;
    if (f.type === 'select') {
      input = el('select', { id: `f-${f.id}` }, ...f.options.map((o) => el('option', {}, o)));
    } else if (f.multiline) {
      input = el('textarea', { id: `f-${f.id}`, rows: String(f.rows || 4), placeholder: f.placeholder || '' });
    } else {
      input = el('input', { id: `f-${f.id}`, type: 'text', placeholder: f.placeholder || '' });
    }
    input.value = saved[f.id] ?? f.value ?? '';
    input.addEventListener('input', () => { saved[f.id] = input.value; store.set(`fields:${lesson.id}`, saved); });
    inputs[f.id] = input;
    return el('div', { class: 'field' }, el('label', { for: `f-${f.id}` }, f.label), input);
  });

  const output = el('div', { class: 'ai-output', 'aria-live': 'polite' });
  const runBtn = el('button', { type: 'button', class: 'primary' }, ex.ai.button);
  const stopBtn = el('button', { type: 'button', hidden: '' }, 'Stop');
  let controller = null;

  runBtn.addEventListener('click', async () => {
    if (!ai.isLoaded()) { openModelDialog(); return; }
    const values = {};
    for (const f of ex.fields) {
      // Empty text fields fall back to the example so the exercise still works.
      values[f.id] = inputs[f.id].value.trim() || f.placeholder || '';
    }
    const req = ex.ai.prompt(values);
    controller = new AbortController();
    runBtn.disabled = true;
    stopBtn.hidden = false;
    output.textContent = '';
    output.classList.add('busy');
    try {
      await ai.generate({
        system: req.system, user: req.user, prefill: req.prefill, maxTokens: req.maxTokens,
        signal: controller.signal,
        onToken: (_, text) => { output.textContent = text; },
      });
    } catch (err) {
      if (err.name !== 'AbortError') output.textContent += `\n\n[Error: ${err.message}]`;
    } finally {
      output.classList.remove('busy');
      runBtn.disabled = false;
      stopBtn.hidden = true;
    }
  });
  stopBtn.addEventListener('click', () => controller?.abort());

  return el('section', { class: 'card exercise' },
    el('h2', {}, 'Exercise'),
    el('p', {}, ex.intro),
    ...fields,
    el('div', { class: 'actions' }, runBtn, stopBtn),
    output,
    el('p', { class: 'muted small' }, 'AI output comes from a small 1B model. It makes mistakes. Judge it like a classmate\'s draft.'));
}

function route() {
  const m = location.hash.match(/^#\/lesson\/(\d+)/);
  const lesson = m && LESSONS.find((l) => l.id === Number(m[1]));
  if (lesson) renderLesson(lesson); else renderHome();
}

window.addEventListener('hashchange', route);
renderStatus();
route();
