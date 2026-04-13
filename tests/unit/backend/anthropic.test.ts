import { describe, it, expect } from 'vitest';
import anthropicConfig from '../../../src/server/providers/anthropic';
import { getProvider } from '../../../src/server/providers/registry';

describe('Anthropic provider adapter', () => {
  it('is registered in the provider registry', () => {
    const provider = getProvider('anthropic');
    expect(provider).toBeDefined();
    expect(provider!.name).toBe('Anthropic (Claude)');
  });

  it('has correct validateEndpoint', () => {
    expect(anthropicConfig.validateEndpoint).toBe('https://api.anthropic.com/v1/messages');
  });

  it('does not support tier detection', () => {
    expect(anthropicConfig.supportsTierDetection).toBe(false);
  });

  describe('buildValidationRequest', () => {
    it('builds a POST request with correct headers and body', () => {
      const req = anthropicConfig.buildValidationRequest('test-key-123');
      expect(req.method).toBe('POST');
      expect(req.url).toBe('https://api.anthropic.com/v1/messages');
      expect(req.headers['x-api-key']).toBe('test-key-123');
      expect(req.headers['anthropic-version']).toBe('2023-06-01');
      expect(req.headers['content-type']).toBe('application/json');
      expect(req.body).toEqual({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      });
      expect(req.timeout).toBe(30000);
    });
  });

  describe('parseValidationResponse', () => {
    it('returns isValid: true for HTTP 200 with a body', () => {
      const result = anthropicConfig.parseValidationResponse({ status: 200, body: { id: 'msg_123' } });
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('returns isValid: false for HTTP 401', () => {
      const result = anthropicConfig.parseValidationResponse({ status: 401, body: { error: 'unauthorized' } });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeUndefined();
    });

    it('returns isValid: false for HTTP 403', () => {
      const result = anthropicConfig.parseValidationResponse({ status: 403, body: { error: 'forbidden' } });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeUndefined();
    });

    it('returns isValid: false with errorMessage for other status codes', () => {
      const result = anthropicConfig.parseValidationResponse({ status: 500, body: {} });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('unexpected response');
    });

    it('handles null response gracefully', () => {
      const result = anthropicConfig.parseValidationResponse(null);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });

    it('handles undefined response gracefully', () => {
      const result = anthropicConfig.parseValidationResponse(undefined);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });

    it('handles non-object response gracefully', () => {
      const result = anthropicConfig.parseValidationResponse('random string');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });

    it('handles response with status 200 but null body', () => {
      const result = anthropicConfig.parseValidationResponse({ status: 200, body: null });
      expect(result.isValid).toBe(false);
    });
  });
});
