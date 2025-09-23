"use client";
import { useState, useCallback } from 'react';

interface DiffLinePart { type: 'context' | 'add' | 'del'; text: string }
interface DiffLine { lineNumberA: number | null; lineNumberB: number | null; parts: DiffLinePart[] }
interface SubmissionCaseView { input: string; expected: string; actual: string; passed: boolean; diff?: { line: { type: 'context' | 'add' | 'del'; value: string }[]; inline?: DiffLine[] } }
interface SubmissionResultView { submissionId: string; status: string; passed: boolean; cases: SubmissionCaseView[] }

interface UseSubmissionOptions { challengeId: string; userId: string; language: string; }

export function useSubmission(opts: UseSubmissionOptions) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<SubmissionResultView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const submit = useCallback(async () => {
    if (!code.trim()) return;
    if (!opts.userId || opts.userId === 'anonymous') {
      setError('Você precisa estar autenticado para submeter.');
      return;
    }
    setLoading(true);
    setError(null);
    setAttempt(a => a + 1);
    try {
      const payload = { code, challengeId: opts.challengeId, userId: opts.userId, language: opts.language };
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('[submission] POST /api/submissions', payload);
      }
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Falha na submissão (HTTP ${res.status})`);
      }
      const data = (await res.json()) as SubmissionResultView;
      setResult(data);
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('[submission] result', data);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [code, opts.challengeId, opts.language, opts.userId]);

  return { code, setCode, submit, loading, error, result, attempt };
}