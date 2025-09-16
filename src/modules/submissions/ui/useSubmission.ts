"use client";
import { useState, useCallback } from 'react';

interface SubmissionCaseView { input: string; expected: string; actual: string; passed: boolean }
interface SubmissionResultView { submissionId: string; status: string; passed: boolean; cases: SubmissionCaseView[] }

interface UseSubmissionOptions {
  challengeId: string;
  userId: string;
  language: string;
}

export function useSubmission(opts: UseSubmissionOptions) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<SubmissionResultView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          challengeId: opts.challengeId,
            userId: opts.userId,
          language: opts.language
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Falha na submissão');
      }
      const data = (await res.json()) as SubmissionResultView;
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [code, opts.challengeId, opts.language, opts.userId]);

  return { code, setCode, submit, loading, error, result };
}