import { useState, useEffect } from 'react';
import type { ValidationResult as ValidationResultType, ProviderOption } from '../shared/types';
import { ValidatorForm } from './components/ValidatorForm';
import { ValidationResult } from './components/ValidationResult';
import './App.css';

export function App() {
  const [result, setResult] = useState<ValidationResultType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<ProviderOption[]>([]);

  useEffect(() => {
    fetch('/api/providers')
      .then((res) => res.json())
      .then((data: ProviderOption[]) => setProviders(data))
      .catch(() => {
        // Silently fail — dropdown will be empty
      });
  }, []);

  async function handleValidate(provider: string, apiKey: string) {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey }),
      });

      let data: ValidationResultType;
      try {
        data = await response.json();
      } catch {
        setResult({
          status: 'error',
          message: 'An unexpected error occurred. Please try again.',
          provider: '',
        });
        return;
      }

      setResult(data);
    } catch {
      setResult({
        status: 'error',
        message: 'Unable to reach the validation server. Check your connection.',
        provider: '',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <header className="app-header">
        <h1 className="app-title">API Key Validator</h1>
        <p className="app-subtitle">
          Test whether your AI provider API keys are working
        </p>
      </header>
      <div className="app-content">
        <ValidatorForm
          onSubmit={handleValidate}
          isLoading={isLoading}
          providers={providers}
        />
        <ValidationResult result={result} />
      </div>
    </>
  );
}
