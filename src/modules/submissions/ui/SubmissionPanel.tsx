'use client';
import React from 'react';

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
    <div className="grid lg:grid-cols-2 gap-4 h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-neutral-400">Editor</h2>
          <button
            onClick={submit}
            disabled={loading || !code.trim()}
            className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-medium transition"
            aria-busy={loading}
          >{loading ? 'Enviando...' : 'Submeter'}</button>
        </div>
        <div className="relative flex-1 border border-neutral-700 rounded overflow-hidden bg-neutral-950">
          {/* Placeholder para Monaco: container responsivo ocupando todo espaço */}
          <textarea
            className="w-full h-full resize-none outline-none bg-transparent font-mono text-xs p-3 text-neutral-100 tracking-wide leading-relaxed"
            spellCheck={false}
            value={code}
            aria-label="Editor de código"
            onChange={e => { setCode(e.target.value); onCodeChange?.(e.target.value); }}
          />
          <div className="absolute top-1 right-2 text-[10px] text-neutral-500 font-mono">{code.split('\n').length} ln</div>
        </div>
      </div>
      <div className="flex flex-col h-full">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-neutral-400 mb-2">Resultado</h2>
        <div className="flex-1 border border-neutral-700 rounded p-3 bg-neutral-900 overflow-auto text-sm">
          {!result && !error && (
            <p className="text-neutral-500">Envie o código para ver o resultado.</p>
          )}
          {error && (
            <p className="text-red-400" role="alert">Erro: {error}</p>
          )}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${result.passed ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                  {result.passed ? 'Passed' : 'Failed'}
                </span>
                <span className="text-neutral-400 text-xs">Submissão: {result.submissionId.slice(0,8)}</span>
              </div>
              <table className="w-full text-xs border-separate border-spacing-y-1">
                <thead className="text-neutral-400">
                  <tr>
                    <th className="text-left font-medium">Entrada</th>
                    <th className="text-left font-medium">Esperado</th>
                    <th className="text-left font-medium">Obtido</th>
                    <th className="text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.cases.map((c, i) => (
                    <tr key={i} className="align-top">
                      <td className="pr-2 text-neutral-300 max-w-[120px] truncate" title={c.input}>{c.input}</td>
                      <td className="pr-2 text-neutral-300 max-w-[140px] truncate" title={c.expected}>{c.expected}</td>
                      <td className="pr-2 text-neutral-300 max-w-[140px] truncate" title={c.actual}>{c.actual}</td>
                      <td>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${c.passed ? 'bg-emerald-700 text-emerald-50' : 'bg-red-700 text-red-50'}`}>
                          {c.passed ? 'OK' : 'X'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}