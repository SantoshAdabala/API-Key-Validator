# API Key Validator

A web app that lets you quickly test whether your AI provider API keys are working. Paste in a key, pick a provider, and get instant feedback on validity.

---

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Vitest](https://img.shields.io/badge/Vitest-Tests-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev)

[![OpenAI](https://img.shields.io/badge/OpenAI-Supported-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com)
[![Anthropic](https://img.shields.io/badge/Anthropic-Supported-D97706?style=flat-square)](https://anthropic.com)
[![Google Gemini](https://img.shields.io/badge/Gemini-Supported-4285F4?style=flat-square&logo=googlegemini&logoColor=white)](https://ai.google.dev)
[![xAI](https://img.shields.io/badge/xAI%20Grok-Supported-000000?style=flat-square)](https://x.ai)

[![Last Commit](https://img.shields.io/github/last-commit/SantoshAdabala/API-Key-Validator?style=flat-square&color=64748B)](https://github.com/SantoshAdabala/API-Key-Validator/commits/main)
[![Stars](https://img.shields.io/github/stars/SantoshAdabala/API-Key-Validator?style=flat-square&color=FBBF24)](https://github.com/SantoshAdabala/API-Key-Validator/stargazers)

---

## Supported Providers

- **OpenAI** — validates via `/v1/models`, with tier/plan detection
- **Anthropic (Claude)** — validates via `/v1/messages`
- **Google (Gemini)** — validates via Generative Language API
- **xAI (Grok)** — validates via `/v1/models`, handles credit-related edge cases

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Express, TypeScript, Axios
- **Testing**: Vitest, Testing Library, fast-check (property-based)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Development

Run the backend and frontend in separate terminals:

```bash
# Terminal 1 — API server (port 3001)
npm run dev:server

# Terminal 2 — Vite dev server (port 5173, proxies /api to backend)
npm run dev:client
```

### Test

```bash
npm test
```

### Build

```bash
npm run build
```
