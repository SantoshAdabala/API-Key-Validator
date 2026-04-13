import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ProviderSelect } from '../../../src/client/components/ProviderSelect';
import type { ProviderOption } from '../../../src/shared/types';

const mockProviders: ProviderOption[] = [
  { id: 'anthropic', name: 'Anthropic (Claude)' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'google', name: 'Google (Gemini)' },
  { id: 'xai', name: 'xAI (Grok)' },
];

describe('ProviderSelect', () => {
  it('renders a select element with label associated via htmlFor/id', () => {
    render(<ProviderSelect value="" onChange={() => {}} providers={mockProviders} />);
    const select = screen.getByLabelText('Provider');
    expect(select).toBeInTheDocument();
    expect(select.tagName).toBe('SELECT');
  });

  it('renders a default placeholder option with empty value', () => {
    render(<ProviderSelect value="" onChange={() => {}} providers={mockProviders} />);
    const placeholder = screen.getByText('Select a provider...');
    expect(placeholder).toBeInTheDocument();
    expect((placeholder as HTMLOptionElement).value).toBe('');
  });

  it('renders all provider options', () => {
    render(<ProviderSelect value="" onChange={() => {}} providers={mockProviders} />);
    for (const provider of mockProviders) {
      expect(screen.getByText(provider.name)).toBeInTheDocument();
    }
  });

  it('calls onChange with the selected provider id', async () => {
    const handleChange = vi.fn();
    render(<ProviderSelect value="" onChange={handleChange} providers={mockProviders} />);
    const select = screen.getByLabelText('Provider');
    await userEvent.selectOptions(select, 'openai');
    expect(handleChange).toHaveBeenCalledWith('openai');
  });

  it('reflects the current value prop', () => {
    render(<ProviderSelect value="google" onChange={() => {}} providers={mockProviders} />);
    const select = screen.getByLabelText('Provider') as HTMLSelectElement;
    expect(select.value).toBe('google');
  });

  it('disables the select when disabled prop is true', () => {
    render(<ProviderSelect value="" onChange={() => {}} providers={mockProviders} disabled />);
    const select = screen.getByLabelText('Provider');
    expect(select).toBeDisabled();
  });

  it('renders a chevron icon that is hidden from assistive technology', () => {
    const { container } = render(
      <ProviderSelect value="" onChange={() => {}} providers={mockProviders} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
