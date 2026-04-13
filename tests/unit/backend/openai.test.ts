import { describe, it, expect } from 'vitest';
import openaiConfig from '../../../src/server/providers/openai';
import { getProvider } from '../../../src/server/providers/registry';

describe('OpenAI provider adapter', () => {
  it('is registered in the provider registry', () => {
    const provider = getProvider('openai');
    expect(provider).toBeDefined();
    expect(provider!.name).toBe('OpenAI');
  });

  it('has correct validateEndpoint', () => {
    expect(openaiConfig.validateEndpoint).toBe('https://api.openai.com/v1/models');
  });

  it('supports tier detection', () => {
    expect(openaiConfig.supportsTierDetection).toBe(true);
    expect(openaiConfig.tierEndpoint).toBe('https://api.openai.com/v1/organization/usage/completions');
    expect(openaiConfig.buildTierRequest).toBeDefined();
    expect(openaiConfig.parseTierResponse).toBeDefined();
  });

  describe('buildValidationRequest', () => {
    it('builds a GET request with Bearer auth header', () => {
      const req = openaiConfig.buildValidationRequest('sk-test-key-789');
      expect(req.method).toBe('GET');
      expect(req.url).toBe('https://api.openai.com/v1/models');
      expect(req.headers['Authorization']).toBe('Bearer sk-test-key-789');
      expect(req.body).toBeUndefined();
      expect(req.timeout).toBe(30000);
    });
  });

  describe('buildTierRequest', () => {
    it('builds a GET request with Bearer auth header to tier endpoint', () => {
      const req = openaiConfig.buildTierRequest!('sk-test-key-789');
      expect(req.method).toBe('GET');
      expect(req.url).toBe('https://api.openai.com/v1/organization/usage/completions');
      expect(req.headers['Authorization']).toBe('Bearer sk-test-key-789');
      expect(req.timeout).toBe(30000);
    });
  });

  describe('parseValidationResponse', () => {
    it('returns isValid: true for HTTP 200', () => {
      const result = openaiConfig.parseValidationResponse({ status: 200, body: { data: [] } });
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('returns isValid: false for HTTP 401', () => {
      const result = openaiConfig.parseValidationResponse({ status: 401, body: { error: { message: 'Invalid API key' } } });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeUndefined();
    });

    it('returns isValid: false for HTTP 403', () => {
      const result = openaiConfig.parseValidationResponse({ status: 403, body: { error: { message: 'Forbidden' } } });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeUndefined();
    });

    it('returns isValid: false with errorMessage for other status codes', () => {
      const result = openaiConfig.parseValidationResponse({ status: 500, body: {} });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('unexpected response');
    });

    it('handles null response gracefully', () => {
      const result = openaiConfig.parseValidationResponse(null);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });

    it('handles undefined response gracefully', () => {
      const result = openaiConfig.parseValidationResponse(undefined);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });

    it('handles non-object response gracefully', () => {
      const result = openaiConfig.parseValidationResponse('random string');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });

    it('handles response with status 200 and empty body', () => {
      const result = openaiConfig.parseValidationResponse({ status: 200, body: {} });
      expect(result.isValid).toBe(true);
    });

    it('returns isValid: false with errorMessage for HTTP 429', () => {
      const result = openaiConfig.parseValidationResponse({ status: 429, body: { error: { message: 'Rate limited' } } });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('unexpected response');
    });
  });

  describe('parseTierResponse', () => {
    it('extracts tier from top-level tier field', () => {
      const tier = openaiConfig.parseTierResponse!({ status: 200, body: { tier: 'pay-as-you-go' } });
      expect(tier).toBe('pay-as-you-go');
    });

    it('extracts plan from top-level plan field', () => {
      const tier = openaiConfig.parseTierResponse!({ status: 200, body: { plan: 'enterprise' } });
      expect(tier).toBe('enterprise');
    });

    it('extracts tier from nested organization object', () => {
      const tier = openaiConfig.parseTierResponse!({ status: 200, body: { organization: { tier: 'free' } } });
      expect(tier).toBe('free');
    });

    it('extracts plan from nested organization object', () => {
      const tier = openaiConfig.parseTierResponse!({ status: 200, body: { organization: { plan: 'team' } } });
      expect(tier).toBe('team');
    });

    it('returns Unknown for null response', () => {
      const tier = openaiConfig.parseTierResponse!(null);
      expect(tier).toBe('Unknown');
    });

    it('returns Unknown for undefined response', () => {
      const tier = openaiConfig.parseTierResponse!(undefined);
      expect(tier).toBe('Unknown');
    });

    it('returns Unknown for empty body', () => {
      const tier = openaiConfig.parseTierResponse!({ status: 200, body: {} });
      expect(tier).toBe('Unknown');
    });

    it('returns Unknown for null body', () => {
      const tier = openaiConfig.parseTierResponse!({ status: 200, body: null });
      expect(tier).toBe('Unknown');
    });

    it('returns Unknown for non-object body', () => {
      const tier = openaiConfig.parseTierResponse!({ status: 200, body: 'string' });
      expect(tier).toBe('Unknown');
    });

    it('returns Unknown for empty tier string', () => {
      const tier = openaiConfig.parseTierResponse!({ status: 200, body: { tier: '' } });
      expect(tier).toBe('Unknown');
    });
  });
});
