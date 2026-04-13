import React from 'react';
import type { ProviderOption } from '../../shared/types';
import './ProviderSelect.css';

interface ProviderSelectProps {
  value: string;
  onChange: (provider: string) => void;
  providers: ProviderOption[];
  disabled?: boolean;
}

export function ProviderSelect({ value, onChange, providers, disabled }: ProviderSelectProps) {
  return (
    <div className="provider-select-wrapper">
      <label className="provider-select-label" htmlFor="provider-select">
        Provider
      </label>
      <div className="provider-select-container">
        <select
          id="provider-select"
          className="provider-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">Select a provider...</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
        <svg
          className="provider-select-chevron"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
