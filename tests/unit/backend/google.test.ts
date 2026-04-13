import { describe, it, expect } from 'vitest';
import googleConfig from '../../../src/server/providers/google';
import { getProvider } from '../../../src/server/providers/registry';

describe('Google Gemini provider adapter', () => {
  it('is registered in the provider registry', () => {
    const provider = getProvider('google');
    expect(provider).toBeDefined();
    expect(provider!.name).toBe('Google (Gemini)');
  });

  it('has correct validateEndpoint', () => {
    expect(googleConfig.validateEndpoint).toBe(
      'https://generativelanguage.googleapis.com/v1/models'
    );
  });

  it('does not support tier detection', () => {
    expect(googleConfig.supportsTierDetection).toBe(false);
  });

  describe('buildValidationRequest', () => {
    it('builds a GET request with the API key as a query parameter', () => {
      const req = googleConfig.buildValidationRequest('test-key-123');
      expect(req.method).toBe('GET');
      expect(req.url).toBe(
        'https://generativelanguage.googleapis.com/v1/models?key=test-key-123'
      );
      expect(req.headers['content-type']).toBe('application/json');
      expect(req.timeout).toBe(30000);
    });

    it('does not include an Authorization header', () => {
      const req = googleConfig.buildValidationRequest('test-key-123');
      expect(req.headers['Authorization']).toBeUndefined();
      expect(req.headers['authorization']).toBeUndefined();
    });

    it('does not include a request body', () => {
      const req = googleConfig.buildValidationRequest('test-key-123');
      expect(req.body).toBeUndefined();
    });
  });

  describe('parseValidationResponse', () => {
    it('returns isValid: true for HTTP 200', () => {
      const result = googleConfig.parseValidationResponse({
        status: 200,
        body: { models: [] },
      });
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('returns isValid: false for HTTP 400', () => {
      const result = googleConfig.parseValidationResponse({
        status: 400,
        body: { error: { message: 'API key not valid' } },
      });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeUndefined();
    });

    it('returns isValid: false for HTTP 401', () => {
      const result = googleConfig.parseValidationResponse({
        status: 401,
        body: { error: { message: 'unauthorized' } },
      });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeUndefined();
    });

    it('returns isValid: false for HTTP 403', () => {
      const result = googleConfig.parseValidationResponse({
        status: 403,
        body: { error: { message: 'forbidden' } },
      });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeUndefined();
    });

    it('returns isValid: false with errorMessage for other status codes', () => {
      const result = googleConfig.parseValidationResponse({ status: 500, body: {} });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('unexpected response');
    });

    it('handles null response gracefully', () => {
      const result = googleConfig.parseValidationResponse(null);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });

    it('handles undefined response gracefully', () => {
      const result = googleConfig.parseValidationResponse(undefined);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });

    it('handles non-object response gracefully', () => {
      const result = googleConfig.parseValidationResponse('random string');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });

    it('handles response with missing status gracefully', () => {
      const result = googleConfig.parseValidationResponse({ body: {} });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });
  });
});
