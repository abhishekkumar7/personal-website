// A tiny web server with no packages to install.
//   1. It serves the files in the "public" folder (your web page).
//   2. It answers POST /api/ask by sending the question to a language model.
// The API key stays here on the server. It is never sent to the browser.

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
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const hasKey = API_KEY && API_KEY !== 'your_real_key_here';

// ---- EDIT ME: the system prompt -------------------------------------------
// This is the standing instruction the model receives with every question.
// Most of what makes your app behave the way it does lives here.
const SYSTEM_PROMPT = `You are a clear, friendly assistant.
Answer in plain language. Keep answers under 150 words unless asked for more.
If you are not sure, say so instead of guessing.`;

// ---- Talk to the model ------------------------------------------------------
async function askModel(question) {
  if (!hasKey) {
    return (
      'Demo mode: the app is working, but no API key was found. ' +
      'Add your key to local.env, stop the app (Ctrl+C) and run npm start again. ' +
      'You asked: "' + question + '"'
    );
  }
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(MODEL) + ':generateContent';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: question }] }],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data.error && data.error.message) || 'The model returned an error (HTTP ' + res.status + ').';
    throw new Error(msg);
  }
  const parts = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
  const text = parts ? parts.map((p) => p.text || '').join('') : '';
  if (!text) throw new Error('The model did not return any text. Try rephrasing the question.');
  return text;
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
        return send(res, 200, { answer: await askModel(question) });
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
  console.log(hasKey ? 'Model: ' + MODEL : 'No API key yet: running in demo mode.');
  console.log('Press Ctrl+C to stop.');
});
