# API Key Validator

A web app that lets you quickly test whether your AI provider API keys are working. Paste in a key, pick a provider, and get instant feedback on validity.

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

### Production Build

```bash
npm run build:client
npm run build:server
```

The Express server serves the built frontend from `dist/client`.

## Testing

```bash
npm test              # run all tests
npm run test:unit     # unit tests only
npm run test:property # property-based tests only
```

## Project Structure

```
src/
├── client/           # React frontend
│   ├── components/   # ValidatorForm, ProviderSelect, ValidationResult
│   └── styles/       # Global styles
├── server/           # Express backend
│   ├── providers/    # Provider adapters (OpenAI, Anthropic, Google, xAI)
│   └── routes/       # API routes
└── shared/           # Shared TypeScript types
```

## How It Works

1. The frontend fetches available providers from `GET /api/providers`
2. User selects a provider and enters an API key
3. The key is sent to `POST /api/validate`
4. The backend uses the provider's adapter to make a lightweight API call and determine if the key is valid
5. For OpenAI, it also attempts to detect the account tier/plan

## Adding a Provider

Create a new file in `src/server/providers/` that implements the `ProviderConfig` interface and calls `registerProvider()`. The provider will automatically appear in the frontend dropdown.

## License

MIT
