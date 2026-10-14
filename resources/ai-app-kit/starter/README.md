# AI app starter

A tiny web app that sends a question to a language model and shows the answer. It has no packages to install.

## Run it
1. Install Node.js (version 18 or newer) from https://nodejs.org
2. Put your API key in `local.env` (replace `your_real_key_here`).
3. In a terminal, inside this folder, run: `npm start`
4. Open http://localhost:3000
5. Stop it with Ctrl+C.

No key yet? The app still runs and answers with a demo message, so you can see the page working.

## Common errors on Windows
- `npm start` gives an error: type `npm.cmd start` instead. It often works better.
- `npm --version` (or any npm command) gives a red "exception" or "running scripts is disabled" error: this is usually a PowerShell security setting. Copy the whole error, paste it into Claude or ChatGPT, and it will give you a short command to allow it, something like `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`. Paste that line into the same terminal, then try again.
- Any other error: copy the error exactly as you see it, paste it into Claude or ChatGPT, and ask it to explain the problem and give you a command to fix it. This solves most problems.

## If the model is busy or has been renamed
- **Busy:** the app retries by itself, waiting a little longer each time, for up to one minute. You do not need to click again. If the main model keeps failing, it tries a second model.
- **Model not found:** model names change. Open `local.env` and set `GEMINI_MODEL` (and, if you like, `GEMINI_FALLBACK_MODEL`). When the app starts, it prints the model names your key can use.
- **Wrong key:** you will see "API key not valid" straight away. Check the key in `local.env`.

## What is in the folder
- `server.js` holds the system prompt and the call to the model. Your key stays here.
- `public/index.html` is the page people see.
- `AppPlan.md` is where you describe the app you want to build.
- `local.env` holds your private settings (key and model names). Never share it.

## Ask your AI assistant to start with
"Read AppPlan.md and README.md. Before editing, summarise what the app is for. Then build the first working version using the files in this folder."
