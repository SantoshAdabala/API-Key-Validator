import { describe, it, expect } from 'vitest';
import xaiConfig from '../../../src/server/providers/xai';
import { getProvider } from '../../../src/server/providers/registry';

describe('xAI provider adapter', () => {
  it('is registered in the provider registry', () => {
    const provider = getProvider('xai');
    expect(provider).toBeDefined();
    expect(provider!.name).toBe('xAI (Grok)');
  });

  it('has correct validateEndpoint', () => {
    expect(xaiConfig.validateEndpoint).toBe('https://api.x.ai/v1/models');
  });

  it('does not support tier detection', () => {
    expect(xaiConfig.supportsTierDetection).toBe(false);
  });

  describe('buildValidationRequest', () => {
    it('builds a GET request with Bearer auth header', () => {
      const req = xaiConfig.buildValidationRequest('test-key-456');
      expect(req.method).toBe('GET');
      expect(req.url).toBe('https://api.x.ai/v1/models');
      expect(req.headers['Authorization']).toBe('Bearer test-key-456');
      expect(req.body).toBeUndefined();
      expect(req.timeout).toBe(30000);
    });
  });

  describe('parseValidationResponse', () => {
    it('returns isValid: true for HTTP 200', () => {
      const result = xaiConfig.parseValidationResponse({ status: 200, body: { id: 'chatcmpl-123' } });
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('returns isValid: false for HTTP 401', () => {
      const result = xaiConfig.parseValidationResponse({ status: 401, body: { error: 'unauthorized' } });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeUndefined();
    });

    it('returns isValid: false for HTTP 403', () => {
      const result = xaiConfig.parseValidationResponse({ status: 403, body: { error: 'forbidden' } });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeUndefined();
    });

    it('returns isValid: false with errorMessage for other status codes', () => {
      const result = xaiConfig.parseValidationResponse({ status: 500, body: {} });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('unexpected response');
    });

    it('handles null response gracefully', () => {
      const result = xaiConfig.parseValidationResponse(null);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });

    it('handles undefined response gracefully', () => {
      const result = xaiConfig.parseValidationResponse(undefined);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });

    it('handles non-object response gracefully', () => {
      const result = xaiConfig.parseValidationResponse('random string');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });
  });
});
