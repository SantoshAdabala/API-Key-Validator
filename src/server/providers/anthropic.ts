import { RequestConfig, ValidationOutcome } from '../../shared/types';
import { ProviderConfig, registerProvider } from './registry';

const anthropicConfig: ProviderConfig = {
  name: 'Anthropic (Claude)',
  validateEndpoint: 'https://api.anthropic.com/v1/messages',

  buildValidationRequest(apiKey: string): RequestConfig {
    return {
      url: this.validateEndpoint,
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: {
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      },
      timeout: 30000,
    };
  },

  parseValidationResponse(response: { status: number; body: any }): ValidationOutcome {
    try {
      if (response == null || typeof response !== 'object') {
        return { isValid: false, errorMessage: 'Received an unexpected response from Anthropic.' };
      }

      const { status } = response;

      if (status === 200 && response.body != null) {
        return { isValid: true };
      }

      if (status === 401 || status === 403) {
        return { isValid: false };
      }

      return {
        isValid: false,
        errorMessage: `Received an unexpected response from Anthropic (HTTP ${status}).`,
      };
    } catch {
      return { isValid: false, errorMessage: 'Received an unexpected response from Anthropic.' };
    }
  },

  supportsTierDetection: false,
};

registerProvider('anthropic', anthropicConfig);

export default anthropicConfig;
