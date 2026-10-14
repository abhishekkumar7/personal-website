// A tiny web server with no packages to install.
//   1. It serves the files in the "public" folder (your web page).
//   2. It answers POST /api/ask by sending the question to a language model.
// The API key stays here on the server. It is never sent to the browser.
//
// If the model is busy (overloaded or rate limited), the app retries by itself,
// waiting a little longer each time, for up to one minute. If the main model keeps
// failing, it switches to a fallback model. You do not need to retry by hand.

const http = require('http');
const fs = require('fs');
const path = require('path');

// ---- Settings: read local.env (KEY=value per line) -------------------------
function loadEnv(file) {
  try {
    const text = fs.readFileSync(path.join(__dirname, file), 'utf8');
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const i = line.indexOf('=');
      if (i < 0) continue;
      const key = line.slice(0, i).trim();
      const value = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch (e) {
    /* no local.env yet: the app runs in demo mode */
  }
}
loadEnv('local.env');

const PORT = Number(process.env.PORT) || 3000;
const API_KEY = process.env.GEMINI_API_KEY || '';
const hasKey = API_KEY && API_KEY !== 'your_real_key_here';

// Model names change over time. Set them in local.env, not here.
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
// The second choice if the first is missing or stays busy. Leave it empty to turn it off.
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL === undefined ? 'gemini-3.5-flash-lite' : process.env.GEMINI_FALLBACK_MODEL;
const MODELS = [MODEL, FALLBACK_MODEL].filter((m, i, a) => m && a.indexOf(m) === i);

// How long to keep trying before giving up (seconds), and the first wait between tries.
const MAX_WAIT_MS = (Number(process.env.GEMINI_MAX_WAIT_SECONDS) || 60) * 1000;
const RETRY_BASE_MS = Number(process.env.RETRY_BASE_MS) || 1000;
const API_BASE = (process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');

// ---- EDIT ME: the system prompt -------------------------------------------
// This is the standing instruction the model receives with every question.
// Most of what makes your app behave the way it does lives here.
const SYSTEM_PROMPT = `You are a clear, friendly assistant.
Answer in plain language. Keep answers under 150 words unless asked for more.
If you are not sure, say so instead of guessing.`;

// ---- Talk to the model ------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BUSY_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

// One request to one model. Never throws: it describes what happened.
async function callModel(model, question, timeoutMs) {
  let res;
  try {
    res = await fetch(API_BASE + '/models/' + encodeURIComponent(model) + ':generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: question }] }],
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    const timedOut = e && (e.name === 'TimeoutError' || e.name === 'AbortError');
    return { kind: timedOut ? 'busy' : 'network', status: 0, message: timedOut ? 'The model took too long to answer.' : 'Could not reach Google. Check your internet connection.' };
  }
  const data = await res.json().catch(() => ({}));
  if (res.ok) {
    const parts = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
    const text = parts ? parts.map((p) => p.text || '').join('') : '';
    if (text) return { kind: 'ok', text };
    return { kind: 'fatal', status: 200, message: 'The model did not return any text. It may have blocked the answer. Try rephrasing the question.' };
  }
  const apiMessage = (data.error && data.error.message) || 'The model returned an error (HTTP ' + res.status + ').';
  const retryAfter = Number(res.headers.get('retry-after'));
  if (res.status === 404) return { kind: 'missing', status: 404, message: apiMessage };
  if (BUSY_STATUSES.has(res.status)) {
    return { kind: 'busy', status: res.status, message: apiMessage, retryAfterMs: retryAfter > 0 ? retryAfter * 1000 : 0 };
  }
  return { kind: 'fatal', status: res.status, message: apiMessage };
}

// Keeps trying, politely, until it has an answer or the time is up.
async function askModel(question) {
  if (!hasKey) {
    return {
      answer:
        'Demo mode: the app is working, but no API key was found. ' +
        'Add your key to local.env, stop the app (Ctrl+C) and run npm start again. ' +
        'You asked: "' + question + '"',
      model: 'demo',
    };
  }
  const started = Date.now();
  const deadline = started + MAX_WAIT_MS;
  const missing = new Set();
  let tries = 0;
  let last = null;

  while (Date.now() < deadline) {
    const usable = MODELS.filter((m) => !missing.has(m));
    if (!usable.length) {
      throw new Error(
        (MODELS.length > 1 ? 'The models "' + MODELS.join('" and "') + '" are' : 'The model "' + MODELS[0] + '" is') + ' not available for your key. ' +
        'Open local.env and set GEMINI_MODEL to a current model name (see the list printed when the app started).'
      );
    }
    // Stay on the main model for the first three tries, then alternate with the fallback.
    const model = tries < 3 ? usable[0] : usable[(tries - 2) % usable.length];
    tries++;
    const r = await callModel(model, question, Math.min(30000, deadline - Date.now()));
    last = r;

    if (r.kind === 'ok') {
      if (tries > 1) console.log('Answered by ' + model + ' after ' + tries + ' tries.');
      return { answer: r.text, model };
    }
    if (r.kind === 'missing') {
      console.log('Model "' + model + '" is not available. Trying the next one.');
      missing.add(model);
      continue;
    }
    if (r.kind === 'fatal') throw new Error(r.message);

    // busy or network trouble: wait a little longer each time, with some randomness
    const backoff = Math.min(10000, RETRY_BASE_MS * 2 ** (tries - 1));
    const wait = Math.round(Math.min(10000, r.retryAfterMs || backoff) * (0.5 + Math.random() * 0.5));
    if (Date.now() + wait >= deadline) break;
    console.log('The model is busy (' + (r.status || r.kind) + '). Retrying in ' + (wait / 1000).toFixed(1) + 's (try ' + tries + ')...');
    await sleep(wait);
  }

  const secs = Math.round((Date.now() - started) / 1000);
  if (last && last.kind === 'network') throw new Error(last.message);
  if (last && last.status === 429) {
    throw new Error('Google says there have been too many requests, or the free daily allowance is used up. The app tried for ' + secs + ' seconds. Wait a minute and try again, and check your limits in Google AI Studio.');
  }
  throw new Error('The model is very busy right now. The app tried for ' + secs + ' seconds. Please wait a minute and try again.');
}

// At start-up, check that the chosen models exist for this key and say so clearly.
async function checkModels() {
  if (!hasKey) return;
  try {
    const res = await fetch(API_BASE + '/models?pageSize=1000', { headers: { 'x-goog-api-key': API_KEY }, signal: AbortSignal.timeout(15000) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const why = (data.error && data.error.message) || 'HTTP ' + res.status;
      console.log('Could not check the model list: ' + why);
      return;
    }
    const names = (data.models || [])
      .filter((m) => !m.supportedGenerationMethods || m.supportedGenerationMethods.includes('generateContent'))
      .map((m) => String(m.name).replace(/^models\//, ''));
    for (const m of MODELS) {
      if (!names.includes(m)) {
        const flash = names.filter((n) => /^gemini-\d/.test(n) && /flash/.test(n) && !/preview|exp|image|tts|live|audio/.test(n)).slice(0, 8);
        console.log('WARNING: model "' + m + '" was not found for your key.' + (flash.length ? ' Available models include: ' + flash.join(', ') + '. Change GEMINI_MODEL in local.env.' : ''));
      }
    }
  } catch (e) {
    console.log('Could not check the model list (' + e.message + ').');
  }
}

// ---- The web server ---------------------------------------------------------
const PUBLIC = path.join(__dirname, 'public');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function send(res, status, body, type) {
  res.writeHead(status, { 'Content-Type': type || 'application/json; charset=utf-8' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');

    if (req.method === 'POST' && url.pathname === '/api/ask') {
      let raw = '';
      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > 20000) return send(res, 413, { error: 'That question is too long.' });
      }
      let question = '';
      try {
        question = String(JSON.parse(raw || '{}').question || '').trim();
      } catch (e) {
        /* ignore bad JSON */
      }
      if (!question) return send(res, 400, { error: 'Please type a question first.' });
      try {
        const out = await askModel(question);
        return send(res, 200, out);
      } catch (err) {
        return send(res, 502, { error: err.message });
      }
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not allowed.' });

    // Static files. Resolve the path and refuse anything outside "public".
    const rel = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const file = path.normalize(path.join(PUBLIC, rel));
    if (!file.startsWith(PUBLIC + path.sep)) return send(res, 403, 'Forbidden', 'text/plain');
    fs.readFile(file, (err, data) => {
      if (err) return send(res, 404, 'Not found', 'text/plain');
      send(res, 200, data, TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream');
    });
  } catch (err) {
    send(res, 500, { error: 'Something went wrong on the server.' });
  }
});

server.listen(PORT, () => {
  console.log('Your app is running at http://localhost:' + PORT);
  console.log(hasKey ? 'Model: ' + MODEL + (MODELS.length > 1 ? ' (fallback: ' + MODELS[1] + ')' : '') : 'No API key yet: running in demo mode.');
  console.log('Press Ctrl+C to stop.');
  checkModels();
});
