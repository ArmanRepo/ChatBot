# Chat

Web app: text input, send to ChatGPT, optional voice input (speech-to-text in the browser).

## Setup

1. Install dependencies (from project root):

```bash
npm run install:all
```

2. Create `.env` in the project root (or in `server/`) and add your OpenAI API key:

```
OPENAI_API_KEY=sk-...
```

You can copy `.env.example` and fill in the key.

## Run

- Terminal 1 — backend: `npm run server` (port 3001)
- Terminal 2 — frontend: `npm run client` (port 5173)

Open http://localhost:5173. The frontend proxies `/api` to the backend.

## Voice input

Use the microphone button next to the input. Recording uses the browser’s Web Speech API (speech-to-text). The result is inserted into the text field; you can edit it and then send. Works in Chrome and other browsers that support SpeechRecognition.

## Tech

- **Backend:** Node.js, Express, OpenAI API (gpt-3.5-turbo)
- **Frontend:** React, Vite, Tailwind CSS
- **Voice:** Web Speech API (no backend needed)
