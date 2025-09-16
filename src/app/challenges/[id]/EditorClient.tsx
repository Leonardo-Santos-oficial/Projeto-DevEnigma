'use client';
import React from 'react';

interface EditorClientProps {
  starterCode: string;
}

export function EditorClient({ starterCode }: EditorClientProps) {
  // Placeholder até integrar Monaco (lazy import futuramente)
  return (
    <div className="border rounded p-2 bg-neutral-900 text-neutral-100 text-sm">
      <pre>{starterCode}</pre>
    </div>
  );
}
