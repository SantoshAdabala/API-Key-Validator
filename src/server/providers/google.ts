import { RequestConfig, ValidationOutcome } from '../../shared/types';
import { ProviderConfig, registerProvider } from './registry';

const googleConfig: ProviderConfig = {
  name: 'Google (Gemini)',
  validateEndpoint: 'https://generativelanguage.googleapis.com/v1/models',

  buildValidationRequest(apiKey: string): RequestConfig {
    return {
      url: `${this.validateEndpoint}?key=${apiKey}`,
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
      timeout: 30000,
    };
  },

  parseValidationResponse(response: { status: number; body: any }): ValidationOutcome {
    try {
      if (response == null || typeof response !== 'object') {
        return { isValid: false, errorMessage: 'Received an unexpected response from Google.' };
      }

      const { status } = response;

      if (status === 200) {
        return { isValid: true };
      }

      if (status === 400 || status === 401 || status === 403) {
        return { isValid: false };
      }

      return {
        isValid: false,
        errorMessage: `Received an unexpected response from Google (HTTP ${status}).`,
      };
    } catch {
      return { isValid: false, errorMessage: 'Received an unexpected response from Google.' };
    }
  },

  supportsTierDetection: false,
};

registerProvider('google', googleConfig);

export default googleConfig;
