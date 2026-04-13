import { RequestConfig, ValidationOutcome } from '../../shared/types';
import { ProviderConfig, registerProvider } from './registry';

const openaiConfig: ProviderConfig = {
  name: 'OpenAI',
  validateEndpoint: 'https://api.openai.com/v1/models',

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
        return { isValid: false, errorMessage: 'Received an unexpected response from OpenAI.' };
      }

      const { status } = response;

      if (status === 200) {
        return { isValid: true };
      }

      if (status === 401 || status === 403) {
        return { isValid: false };
      }

      return {
        isValid: false,
        errorMessage: `Received an unexpected response from OpenAI (HTTP ${status}).`,
      };
    } catch {
      return { isValid: false, errorMessage: 'Received an unexpected response from OpenAI.' };
    }
  },

  supportsTierDetection: true,
  tierEndpoint: 'https://api.openai.com/v1/organization/usage/completions',

  buildTierRequest(apiKey: string): RequestConfig {
    return {
      url: this.tierEndpoint!,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      timeout: 30000,
    };
  },

  parseTierResponse(response: { status: number; body: any }): string {
    try {
      if (response == null || typeof response !== 'object') {
        return 'Unknown';
      }

      const { body } = response;

      if (body == null || typeof body !== 'object') {
        return 'Unknown';
      }

      if (typeof body.tier === 'string' && body.tier.length > 0) {
        return body.tier;
      }

      if (typeof body.plan === 'string' && body.plan.length > 0) {
        return body.plan;
      }

      if (body.organization != null && typeof body.organization === 'object') {
        if (typeof body.organization.tier === 'string' && body.organization.tier.length > 0) {
          return body.organization.tier;
        }
        if (typeof body.organization.plan === 'string' && body.organization.plan.length > 0) {
          return body.organization.plan;
        }
      }

      return 'Unknown';
    } catch {
      return 'Unknown';
    }
  },
};

registerProvider('openai', openaiConfig);

export default openaiConfig;
