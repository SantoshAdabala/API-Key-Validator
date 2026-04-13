import type { VercelRequest, VercelResponse } from '@vercel/node';
import { RequestConfig, ValidationOutcome, ProviderOption, ValidationResult } from '../src/shared/types';
import axios, { AxiosError } from 'axios';

// --- Provider configs inlined for serverless ---

interface ProviderConfig {
  name: string;
  validateEndpoint: string;
  buildValidationRequest(apiKey: string): RequestConfig;
  parseValidationResponse(response: any): ValidationOutcome;
  supportsTierDetection: boolean;
  tierEndpoint?: string;
  buildTierRequest?(apiKey: string): RequestConfig;
  parseTierResponse?(response: any): string;
}

const providers: Record<string, ProviderConfig> = {
  anthropic: {
    name: 'Anthropic (Claude)',
    validateEndpoint: 'https://api.anthropic.com/v1/messages',
    buildValidationRequest(apiKey: string): RequestConfig {
      return {
        url: this.validateEndpoint,
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: { model: 'claude-3-haiku-20240307', max_tokens: 1, messages: [{ role: 'user', content: 'hi' }] },
        timeout: 30000,
      };
    },
    parseValidationResponse(response: { status: number; body: any }): ValidationOutcome {
      if (!response || typeof response !== 'object') return { isValid: false, errorMessage: 'Unexpected response from Anthropic.' };
      if (response.status === 200 && response.body != null) return { isValid: true };
      if (response.status === 401 || response.status === 403) return { isValid: false };
      return { isValid: false, errorMessage: `Unexpected response from Anthropic (HTTP ${response.status}).` };
    },
    supportsTierDetection: false,
  },
  openai: {
    name: 'OpenAI',
    validateEndpoint: 'https://api.openai.com/v1/models',
    buildValidationRequest(apiKey: string): RequestConfig {
      return { url: this.validateEndpoint, method: 'GET', headers: { Authorization: `Bearer ${apiKey}` }, timeout: 30000 };
    },
    parseValidationResponse(response: { status: number; body: any }): ValidationOutcome {
      if (!response || typeof response !== 'object') return { isValid: false, errorMessage: 'Unexpected response from OpenAI.' };
      if (response.status === 200) return { isValid: true };
      if (response.status === 401 || response.status === 403) return { isValid: false };
      return { isValid: false, errorMessage: `Unexpected response from OpenAI (HTTP ${response.status}).` };
    },
    supportsTierDetection: false,
  },
  google: {
    name: 'Google (Gemini)',
    validateEndpoint: 'https://generativelanguage.googleapis.com/v1/models',
    buildValidationRequest(apiKey: string): RequestConfig {
      return { url: `${this.validateEndpoint}?key=${apiKey}`, method: 'GET', headers: { 'content-type': 'application/json' }, timeout: 30000 };
    },
    parseValidationResponse(response: { status: number; body: any }): ValidationOutcome {
      if (!response || typeof response !== 'object') return { isValid: false, errorMessage: 'Unexpected response from Google.' };
      if (response.status === 200) return { isValid: true };
      if ([400, 401, 403].includes(response.status)) return { isValid: false };
      return { isValid: false, errorMessage: `Unexpected response from Google (HTTP ${response.status}).` };
    },
    supportsTierDetection: false,
  },
  xai: {
    name: 'xAI (Grok)',
    validateEndpoint: 'https://api.x.ai/v1/models',
    buildValidationRequest(apiKey: string): RequestConfig {
      return { url: this.validateEndpoint, method: 'GET', headers: { Authorization: `Bearer ${apiKey}` }, timeout: 30000 };
    },
    parseValidationResponse(response: { status: number; body: any }): ValidationOutcome {
      if (!response || typeof response !== 'object') return { isValid: false, errorMessage: 'Unexpected response from xAI.' };
      const { status, body } = response;
      if (status === 200) return { isValid: true };
      if (status === 401) return { isValid: false };
      if (status === 403) {
        const err = typeof body?.error === 'string' ? body.error.toLowerCase() : '';
        if (err.includes('credit') || err.includes('license')) return { isValid: true };
        return { isValid: false };
      }
      if (status === 400 && body?.error && typeof body.error === 'string' && body.error.toLowerCase().includes('api key')) return { isValid: false };
      return { isValid: false, errorMessage: `Unexpected response from xAI (HTTP ${status}).` };
    },
    supportsTierDetection: false,
  },
};

// --- Validation logic ---

async function validateApiKey(config: ProviderConfig, apiKey: string): Promise<ValidationResult> {
  const name = config.name;
  try {
    const req = config.buildValidationRequest(apiKey);
    const res = await axios({ url: req.url, method: req.method, headers: req.headers, data: req.body, timeout: 30000, validateStatus: () => true });
    const outcome = config.parseValidationResponse({ status: res.status, body: res.data });
    if (outcome.isValid) return { status: 'valid', message: 'API key is valid', provider: name };
    if (outcome.errorMessage) return { status: 'error', message: outcome.errorMessage, provider: name };
    return { status: 'invalid', message: 'API key is invalid', provider: name };
  } catch (err) {
    if (err instanceof AxiosError) {
      if (['ECONNABORTED', 'ETIMEDOUT'].includes(err.code || '') || err.message?.includes('timeout'))
        return { status: 'error', message: `Request to ${name} timed out.`, provider: name };
    }
    return { status: 'error', message: `Unable to reach ${name} API.`, provider: name };
  }
}

// --- Serverless handler ---

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url?.replace(/\?.*$/, '') || '';

  if (req.method === 'GET' && path === '/api/providers') {
    const list: ProviderOption[] = Object.entries(providers).map(([id, c]) => ({ id, name: c.name }));
    return res.json(list);
  }

  if (req.method === 'POST' && path === '/api/validate') {
    const { provider, apiKey } = req.body || {};
    if (!provider) return res.status(400).json({ status: 'error', message: 'Provider is required', provider: '' });
    const config = providers[provider];
    if (!config) return res.status(400).json({ status: 'error', message: `Unsupported provider: ${provider}`, provider });
    if (!apiKey) return res.status(400).json({ status: 'error', message: 'API key is required', provider });
    const result = await validateApiKey(config, apiKey);
    return res.json(result);
  }

  return res.status(404).json({ error: 'Not found' });
}
