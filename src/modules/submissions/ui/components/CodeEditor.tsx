"use client";
import type { OnMount } from '@monaco-editor/react';
import dynamic from 'next/dynamic';
import React, { useCallback } from 'react';

// Lazy load do Monaco sem SSR
const Monaco = dynamic(async () => {
  const mod = await import('@monaco-editor/react');
  return mod.default;
}, { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">Carregando editor...</div> });

export interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (code: string) => void;
  height?: string | number;
  readOnly?: boolean;
}

// Encapsula configuração mínima mantendo SRP
export function CodeEditor({ value, language, onChange, height = '100%', readOnly }: CodeEditorProps) {
  const handleChange = useCallback((val?: string) => {
    onChange(val ?? '');
  }, [onChange]);

  const handleMount = useCallback<OnMount>((editor, monaco) => {
    // Define tema custom inspirado em matrix usando tokens existentes
    monaco.editor.defineTheme('matrix-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'd1d9d7', background: '0a0f0d' },
        { token: 'comment', foreground: '4b635c', fontStyle: 'italic' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: '10b981' },
        { token: 'keyword', foreground: '059669' },
        { token: 'delimiter', foreground: '6ee7b7' },
        { token: 'type', foreground: '2dd4bf' },
        { token: 'function', foreground: '34d399' },
        { token: 'variable', foreground: 'd1d9d7' }
      ],
      colors: {
        'editor.background': '#0a0f0d',
        'editor.foreground': '#d1d9d7',
        'editorLineNumber.foreground': '#33413d',
        'editorLineNumber.activeForeground': '#10b981',
        'editorCursor.foreground': '#34d399',
        'editor.selectionBackground': '#065f4680',
        'editor.inactiveSelectionBackground': '#065f462e',
        'editor.lineHighlightBackground': '#10211d66',
        'editorIndentGuide.background': '#1e2a27',
        'editorIndentGuide.activeBackground': '#2d3a37',
        'editorGutter.background': '#0a0f0d',
        'editorBracketMatch.background': '#065f4622',
        'editorBracketMatch.border': '#065f4680'
      }
    });
    monaco.editor.setTheme('matrix-dark');
  }, []);

  return (
    <div className="relative h-full">
      <Monaco
        value={value}
        language={language}
        onChange={handleChange}
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          smoothScrolling: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly,
          tabSize: 2
        }}
        theme="matrix-dark"
        height={height}
      />
    </div>
  );
}
