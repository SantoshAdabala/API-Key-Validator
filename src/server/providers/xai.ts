import { RequestConfig, ValidationOutcome } from '../../shared/types';
import { ProviderConfig, registerProvider } from './registry';

const xaiConfig: ProviderConfig = {
  name: 'xAI (Grok)',
  validateEndpoint: 'https://api.x.ai/v1/models',

  buildValidationRequest(apiKey: string): RequestConfig {
    return {
      url: this.validateEndpoint,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      timeout: 30000,
    };
  },

  parseValidationResponse(response: { status: number; body: any }): ValidationOutcome {
    try {
      if (response == null || typeof response !== 'object') {
        return { isValid: false, errorMessage: 'Received an unexpected response from xAI.' };
      }

      const { status, body } = response;

      if (status === 200) {
        return { isValid: true };
      }

      if (status === 401) {
        return { isValid: false };
      }

      // xAI returns 403 with "doesn't have any credits" for valid keys on unfunded accounts
      if (status === 403) {
        const errorStr = typeof body?.error === 'string' ? body.error : '';
        if (errorStr.toLowerCase().includes('credit') || errorStr.toLowerCase().includes('license')) {
          return { isValid: true };
        }
        return { isValid: false };
      }

      // xAI returns 400 with "Incorrect API key" for invalid keys
      if (status === 400 && body?.error && typeof body.error === 'string' && body.error.toLowerCase().includes('api key')) {
        return { isValid: false };
      }

      return {
        isValid: false,
        errorMessage: `Received an unexpected response from xAI (HTTP ${status}).`,
      };
    } catch {
      return { isValid: false, errorMessage: 'Received an unexpected response from xAI.' };
    }
  },

  supportsTierDetection: false,
};

registerProvider('xai', xaiConfig);

export default xaiConfig;
