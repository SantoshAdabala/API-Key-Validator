/**
 * Core data structure returned by the backend and consumed by the frontend.
 * Represents the outcome of an API key validation request.
 */
export interface ValidationResult {
  status: "valid" | "invalid" | "error";
  message: string;
  provider: string;
  tier?: string;
}

/**
 * Used by the frontend to populate the provider dropdown.
 */
export interface ProviderOption {
  id: string;
  name: string;
}

/**
 * Internal structure used by the Validation Engine to make outbound HTTP requests.
 */
export interface RequestConfig {
  url: string;
  method: "GET" | "POST";
  headers: Record<string, string>;
  body?: any;
  timeout: number;
}

/**
 * Internal structure returned by a provider adapter's parseValidationResponse.
 */
export interface ValidationOutcome {
  isValid: boolean;
  errorMessage?: string;
}
