import type { Metadata } from 'next';
import React from 'react';

import './globals.css';
import { MatrixRainBackground } from '@modules/shared/ui/MatrixRainBackground';

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 font-sans flex flex-col">
      {children}
    </div>
  );
}

export const metadata: Metadata = {
  title: 'DevEnigma',
  description: 'Plataforma gamificada de debugging e refatoração.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full antialiased selection:bg-emerald-600/40 selection:text-emerald-50">
        <AppShell>
          <MatrixRainBackground />
          {children}
        </AppShell>
      </body>
    </html>
  );
}
