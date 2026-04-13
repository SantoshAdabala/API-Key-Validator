import axios, { AxiosError } from 'axios';
import { ValidationResult } from '../../shared/types';
import { ProviderConfig } from './registry';

/**
 * Validates an API key against a provider's API.
 *
 * 1. Builds the request config from the provider
 * 2. Makes the HTTP request with axios (30s timeout)
 * 3. Passes the response to the provider's parseValidationResponse
 * 4. If valid and provider supports tier detection, fetches tier info
 * 5. Returns the final ValidationResult
 */
export async function validateApiKey(
  providerConfig: ProviderConfig,
  apiKey: string,
): Promise<ValidationResult> {
  const providerName = providerConfig.name;
  let keyRef: string | null = apiKey;

  try {
    const requestConfig = providerConfig.buildValidationRequest(keyRef);
    // DEBUG: log request details (remove after debugging)
    console.log(`[DEBUG] ${providerName} request:`, requestConfig.method, requestConfig.url);

    let responseStatus: number;
    let responseBody: any;

    try {
      const axiosResponse = await axios({
        url: requestConfig.url,
        method: requestConfig.method,
        headers: requestConfig.headers,
        data: requestConfig.body,
        timeout: 30000,
        validateStatus: () => true,
      });
      responseStatus = axiosResponse.status;
      responseBody = axiosResponse.data;
      // DEBUG: log provider response (remove after debugging)
      console.log(`[DEBUG] ${providerName} response:`, responseStatus, JSON.stringify(responseBody).slice(0, 500));
    } catch (err) {
      return handleRequestError(err, providerName);
    }

    const outcome = providerConfig.parseValidationResponse({
      status: responseStatus,
      body: responseBody,
    });

    if (outcome.isValid) {
      let tier: string | undefined;

      if (providerConfig.supportsTierDetection && providerConfig.buildTierRequest && providerConfig.parseTierResponse) {
        tier = await fetchTierInfo(providerConfig, keyRef);
      }

      const result: ValidationResult = {
        status: 'valid',
        message: 'API key is valid',
        provider: providerName,
      };
      if (tier !== undefined) {
        result.tier = tier;
      }
      return result;
    }

    if (outcome.errorMessage) {
      return {
        status: 'error',
        message: outcome.errorMessage,
        provider: providerName,
      };
    }

    return {
      status: 'invalid',
      message: 'API key is invalid',
      provider: providerName,
    };
  } finally {
    keyRef = null;
  }
}


/**
 * Fetches tier/plan info for a valid API key.
 * Returns the tier string on success, or undefined on failure (graceful degradation).
 */
async function fetchTierInfo(
  providerConfig: ProviderConfig,
  apiKey: string,
): Promise<string | undefined> {
  try {
    const tierRequestConfig = providerConfig.buildTierRequest!(apiKey);

    const axiosResponse = await axios({
      url: tierRequestConfig.url,
      method: tierRequestConfig.method,
      headers: tierRequestConfig.headers,
      data: tierRequestConfig.body,
      timeout: 30000,
      validateStatus: () => true,
    });

    return providerConfig.parseTierResponse!({
      status: axiosResponse.status,
      body: axiosResponse.data,
    });
  } catch {
    // Tier fetch failed — graceful degradation, return without tier
    return undefined;
  }
}

/**
 * Maps axios errors to appropriate ValidationResult error responses.
 */
function handleRequestError(err: unknown, providerName: string): ValidationResult {
  if (err instanceof AxiosError) {
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
      return {
        status: 'error',
        message: `Validation request to ${providerName} timed out after 30 seconds.`,
        provider: providerName,
      };
    }

    if (
      err.code === 'ENOTFOUND' ||
      err.code === 'ECONNREFUSED' ||
      err.code === 'ECONNRESET' ||
      err.code === 'ERR_NETWORK' ||
      err.code === 'EAI_AGAIN'
    ) {
      return {
        status: 'error',
        message: `Unable to reach ${providerName} API. Check your network connection.`,
        provider: providerName,
      };
    }
  }

  // Fallback for any other unexpected error
  return {
    status: 'error',
    message: `Unable to reach ${providerName} API. Check your network connection.`,
    provider: providerName,
  };
}
