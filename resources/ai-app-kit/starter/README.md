# AI app starter

A tiny web app that sends a question to a language model and shows the answer. It has no packages to install.

## Run it
1. Install Node.js (version 18 or newer) from https://nodejs.org
2. Put your API key in `local.env` (replace `your_real_key_here`).
3. In a terminal, inside this folder, run: `npm start`
4. Open http://localhost:3000
5. Stop it with Ctrl+C.

No key yet? The app still runs and answers with a demo message, so you can see the page working.

## What is in the folder
- `server.js` holds the system prompt and the call to the model. Your key stays here.
- `public/index.html` is the page people see.
- `AppPlan.md` is where you describe the app you want to build.
- `local.env` holds your private settings. Never share it.

## Ask your AI assistant to start with
"Read AppPlan.md and README.md. Before editing, summarise what the app is for. Then build the first working version using the files in this folder."
