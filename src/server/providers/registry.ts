import { RequestConfig, ValidationOutcome, ProviderOption } from '../../shared/types';

/**
 * Configuration for a provider adapter.
 * Each supported AI provider implements this interface.
 */
export interface ProviderConfig {
  name: string;
  validateEndpoint: string;
  buildValidationRequest(apiKey: string): RequestConfig;
  parseValidationResponse(response: any): ValidationOutcome;
  supportsTierDetection: boolean;
  tierEndpoint?: string;
  buildTierRequest?(apiKey: string): RequestConfig;
  parseTierResponse?(response: any): string;
}

/**
 * Registry map of provider identifiers to their configurations.
 * Populated as provider adapters are registered.
 */
const registry = new Map<string, ProviderConfig>();

/**
 * Register a provider adapter in the registry.
 */
export function registerProvider(id: string, config: ProviderConfig): void {
  registry.set(id, config);
}

/**
 * Look up a provider configuration by its identifier.
 * Returns undefined if the provider is not registered.
 */
export function getProvider(id: string): ProviderConfig | undefined {
  return registry.get(id);
}

/**
 * Returns all registered providers as ProviderOption[] for the frontend dropdown.
 */
export function getAllProviders(): ProviderOption[] {
  return Array.from(registry.entries()).map(([id, config]) => ({
    id,
    name: config.name,
  }));
}
