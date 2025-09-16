'use client';
import React from 'react';

import { CodeEditor } from './components/CodeEditor';
import { useSubmission } from './useSubmission';

interface SubmissionPanelProps {
  challengeId: string;
  userId: string; // futuramente da sessão
  language: string;
  initialCode: string;
  onCodeChange?: (code: string) => void;
}

export function SubmissionPanel({ challengeId, userId, language, initialCode, onCodeChange }: SubmissionPanelProps) {
  const { code, setCode, submit, loading, error, result } = useSubmission({ challengeId, userId, language });
  React.useEffect(() => { setCode(initialCode); }, [initialCode, setCode]);

  return (
    <div className="h-full grid gap-5 xl:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,44%)]">
      <div className="flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Editor</h2>
          <button
            onClick={submit}
            disabled={loading || !code.trim()}
            className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:ring-offset-2 focus:ring-offset-neutral-900"
            aria-busy={loading}
          >{loading ? 'Enviando...' : 'Submeter'}</button>
        </div>
        <div className="relative flex-1 min-h-[400px] rounded border border-neutral-700/70 bg-neutral-950 shadow-inner shadow-black/40">
          <CodeEditor
            value={code}
            language={language}
            onChange={(val) => { setCode(val); onCodeChange?.(val); }}
            height="100%"
          />
        </div>
      </div>
      <div className="flex flex-col min-h-0">
        <h2 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-neutral-400 mb-3">Resultado</h2>
        <div className="flex-1 min-h-[300px] rounded border border-neutral-700/70 bg-neutral-900/80 backdrop-blur-sm p-4 overflow-auto text-sm custom-scroll">
          {!result && !error && (
            <p className="text-neutral-500">Envie o código para ver o resultado.</p>
          )}
          {error && (
            <p className="text-red-400" role="alert">Erro: {error}</p>
          )}
          {result && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium shadow ${result.passed ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                  {result.passed ? 'Passed' : 'Failed'}
                </span>
                <span className="text-neutral-400 text-[11px] tracking-wide">Submissão: {result.submissionId.slice(0,8)}</span>
              </div>
              <div className="overflow-x-auto rounded">
                <table className="w-full text-xs border-collapse">
                  <thead className="text-neutral-400 sticky top-0 bg-neutral-900/95 backdrop-blur">
                    <tr className="text-left">
                      <th className="py-1 pr-3 font-medium">Entrada</th>
                      <th className="py-1 pr-3 font-medium">Esperado</th>
                      <th className="py-1 pr-3 font-medium">Obtido</th>
                      <th className="py-1 pr-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="align-top divide-y divide-neutral-800/60">
                    {result.cases.map((c, i) => (
                      <tr key={i} className="hover:bg-neutral-800/40 transition">
                        <td className="py-1 pr-3 max-w-[140px] truncate" title={c.input}>{c.input}</td>
                        <td className="py-1 pr-3 max-w-[160px] truncate" title={c.expected}>{c.expected}</td>
                        <td className="py-1 pr-3 max-w-[160px] truncate" title={c.actual}>{c.actual}</td>
                        <td className="py-1 pr-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${c.passed ? 'bg-emerald-700/80 text-emerald-50' : 'bg-red-700/80 text-red-50'}`}>
                            {c.passed ? 'OK' : 'X'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}