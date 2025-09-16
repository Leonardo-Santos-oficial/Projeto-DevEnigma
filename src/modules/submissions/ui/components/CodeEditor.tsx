"use client";
import dynamic from 'next/dynamic';
import React from 'react';

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
  const handleChange = (val?: string) => {
    onChange(val ?? '');
  };

  return (
    <div className="relative h-full">
      <Monaco
        value={value}
        language={language}
        onChange={handleChange}
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
        theme="vs-dark"
        height={height}
      />
    </div>
  );
}
