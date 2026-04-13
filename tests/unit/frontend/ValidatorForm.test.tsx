import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ValidatorForm } from '../../../src/client/components/ValidatorForm';
import type { ProviderOption } from '../../../src/shared/types';

const mockProviders: ProviderOption[] = [
  { id: 'anthropic', name: 'Anthropic (Claude)' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'google', name: 'Google (Gemini)' },
  { id: 'xai', name: 'xAI (Grok)' },
];

describe('ValidatorForm', () => {
  it('renders a masked API key input field', () => {
    render(<ValidatorForm onSubmit={() => {}} isLoading={false} providers={mockProviders} />);
    const input = screen.getByLabelText('API Key');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders the provider select dropdown', () => {
    render(<ValidatorForm onSubmit={() => {}} isLoading={false} providers={mockProviders} />);
    expect(screen.getByLabelText('Provider')).toBeInTheDocument();
  });

  it('renders a Validate button', () => {
    render(<ValidatorForm onSubmit={() => {}} isLoading={false} providers={mockProviders} />);
    expect(screen.getByRole('button', { name: 'Validate' })).toBeInTheDocument();
  });

  it('shows "API key is required" when submitting with empty key', async () => {
    const handleSubmit = vi.fn();
    render(<ValidatorForm onSubmit={handleSubmit} isLoading={false} providers={mockProviders} />);

    await userEvent.selectOptions(screen.getByLabelText('Provider'), 'openai');
    await userEvent.click(screen.getByRole('button', { name: 'Validate' }));

    expect(screen.getByText('API key is required')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('shows "Please select a provider" when submitting without provider', async () => {
    const handleSubmit = vi.fn();
    render(<ValidatorForm onSubmit={handleSubmit} isLoading={false} providers={mockProviders} />);

    const input = screen.getByLabelText('API Key');
    await userEvent.type(input, 'sk-test-key-123');
    await userEvent.click(screen.getByRole('button', { name: 'Validate' }));

    expect(screen.getByText('Please select a provider')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('shows both errors when submitting with empty key and no provider', async () => {
    const handleSubmit = vi.fn();
    render(<ValidatorForm onSubmit={handleSubmit} isLoading={false} providers={mockProviders} />);

    await userEvent.click(screen.getByRole('button', { name: 'Validate' }));

    expect(screen.getByText('API key is required')).toBeInTheDocument();
    expect(screen.getByText('Please select a provider')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with provider and apiKey on valid submission', async () => {
    const handleSubmit = vi.fn();
    render(<ValidatorForm onSubmit={handleSubmit} isLoading={false} providers={mockProviders} />);

    await userEvent.type(screen.getByLabelText('API Key'), 'sk-test-key-123');
    await userEvent.selectOptions(screen.getByLabelText('Provider'), 'anthropic');
    await userEvent.click(screen.getByRole('button', { name: 'Validate' }));

    expect(handleSubmit).toHaveBeenCalledWith('anthropic', 'sk-test-key-123');
  });

  it('clears apiKey from state after successful submission', async () => {
    const handleSubmit = vi.fn();
    render(<ValidatorForm onSubmit={handleSubmit} isLoading={false} providers={mockProviders} />);

    const input = screen.getByLabelText('API Key') as HTMLInputElement;
    await userEvent.type(input, 'sk-test-key-123');
    await userEvent.selectOptions(screen.getByLabelText('Provider'), 'openai');
    await userEvent.click(screen.getByRole('button', { name: 'Validate' }));

    expect(input.value).toBe('');
  });

  it('disables inputs and button when isLoading is true', () => {
    render(<ValidatorForm onSubmit={() => {}} isLoading={true} providers={mockProviders} />);

    expect(screen.getByLabelText('API Key')).toBeDisabled();
    expect(screen.getByLabelText('Provider')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows a spinner instead of "Validate" text when loading', () => {
    render(<ValidatorForm onSubmit={() => {}} isLoading={true} providers={mockProviders} />);

    expect(screen.queryByText('Validate')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Validating')).toBeInTheDocument();
  });
});
