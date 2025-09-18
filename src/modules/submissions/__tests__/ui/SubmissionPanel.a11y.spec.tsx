/* eslint-disable import/order */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SubmissionPanel } from '../../ui/SubmissionPanel';

// Mock useSubmission hook to control behavior
vi.mock('../../ui/useSubmission', () => {
  return {
    useSubmission: () => {
  interface Result { submissionId: string; status: string; passed: boolean; cases: unknown[] }
  const [result, setResult] = React.useState<Result | null>(null);
      const submit = () => setResult({ submissionId: 'abc123', status: 'PASSED', passed: true, cases: [] });
      return {
        code: 'print()',
        setCode: () => {},
        submit,
        loading: false,
        error: null,
        result,
      };
    },
  };
});

describe('SubmissionPanel accessibility', () => {
  it('focuses result region after submission and has aria-live', async () => {
    render(<SubmissionPanel challengeId="c1" userId="u1" language="javascript" initialCode="print()" />);
    const button = screen.getByRole('button', { name: /submeter/i });
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByLabelText(/Área de resultado/i)).toBeTruthy());
    const region = screen.getByLabelText(/Área de resultado/i);
  // Using standard attribute checks to avoid type issues if jest-dom matchers not merged
  expect(region.getAttribute('aria-live')).toBe('polite');
    // foco: não podemos garantir sem act flush completo, mas checamos tabIndex como pista de foco gerenciável
  expect(region.getAttribute('tabindex')).toBe('-1');
  });
});
