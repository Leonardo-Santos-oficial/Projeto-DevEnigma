import type { Metadata } from 'next';
import React from 'react';

import './globals.css';
import { MatrixRainBackground } from '@modules/shared/ui/MatrixRainBackground';

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 font-sans flex flex-col">
      <header className="relative z-20 border-b border-neutral-800/70 backdrop-blur-sm bg-neutral-950/60">
        <nav className="max-w-5xl mx-auto flex items-center gap-6 px-4 py-3" aria-label="Navegação principal">
          <a href="/" className="text-lg font-semibold tracking-tight hover:text-emerald-400 transition-colors">DevEnigma</a>
          <ul className="flex items-center gap-4 text-sm">
            <li><a href="/challenges" className="hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1">Desafios</a></li>
            <li><a href="/ranking" className="hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1">Ranking</a></li>
          </ul>
        </nav>
      </header>
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
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
          <MatrixRainBackground variant="editor" intensity="low" />
          {children}
        </AppShell>
      </body>
    </html>
  );
}
