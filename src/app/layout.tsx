import type { Metadata } from 'next';
import React from 'react';

import './globals.css';
import { AuthSessionProvider } from '@core/auth/SessionProvider';
import { AppHeader } from '@modules/shared/ui/AppHeader';
import { MatrixRainBackground } from '@modules/shared/ui/MatrixRainBackground';

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 font-sans flex flex-col">
      <AppHeader />
      <div className="relative z-10 flex-1 flex flex-col">{children}</div>
    </div>
  );
}

export const metadata: Metadata = {
  title: 'DevEnigma',
  description: 'Plataforma gamificada de debugging e refatoração.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* suppressHydrationWarning evita warning de atributos extras (ex.: data-page-optimizer-editable) vindos do servidor */}
      <html lang="pt-BR" className="h-full" suppressHydrationWarning>
        <body className="h-full antialiased selection:bg-emerald-600/40 selection:text-emerald-50">
          <AuthSessionProvider>
            <AppShell>
              <MatrixRainBackground variant="editor" intensity="low" />
              {children}
            </AppShell>
          </AuthSessionProvider>
        </body>
      </html>
    </>
  );
}
