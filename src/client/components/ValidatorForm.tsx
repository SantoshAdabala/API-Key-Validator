import React, { useState } from 'react';
import type { ProviderOption } from '../../shared/types';
import { ProviderSelect } from './ProviderSelect';
import './ValidatorForm.css';

interface ValidatorFormProps {
  onSubmit: (provider: string, apiKey: string) => void;
  isLoading: boolean;
  providers: ProviderOption[];
}

export function ValidatorForm({ onSubmit, isLoading, providers }: ValidatorFormProps) {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('');
  const [errors, setErrors] = useState<{ apiKey?: string; provider?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { apiKey?: string; provider?: string } = {};

    if (!apiKey.trim()) {
      newErrors.apiKey = 'API key is required';
    }
    if (!provider) {
      newErrors.provider = 'Please select a provider';
    }

    if (newErrors.apiKey || newErrors.provider) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(provider, apiKey);
    setApiKey('');
  };

  return (
    <form className="validator-form" onSubmit={handleSubmit}>
      <div className="validator-form-field">
        <label className="validator-form-label" htmlFor="api-key-input">
          API Key
        </label>
        <input
          id="api-key-input"
          className="validator-form-input"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key..."
          disabled={isLoading}
        />
        {errors.apiKey && <p className="validator-form-error">{errors.apiKey}</p>}
      </div>

      <ProviderSelect
        value={provider}
        onChange={setProvider}
        providers={providers}
        disabled={isLoading}
      />
      {errors.provider && <p className="validator-form-error">{errors.provider}</p>}

      <button
        type="submit"
        className="validator-form-button"
        disabled={isLoading}
      >
        {isLoading ? <span className="validator-form-spinner" aria-label="Validating" /> : 'Validate'}
      </button>
    </form>
  );
}
