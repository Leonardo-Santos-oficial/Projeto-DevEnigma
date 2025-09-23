/* eslint-disable import/order */
import Link from 'next/link';

import { getCurrentUser } from '@core/auth/session';
import { AuthActions } from './AuthActions';

export async function AppHeader() {
  const user = await getCurrentUser();
  return (
    <header className="relative z-20 border-b border-neutral-800/70 backdrop-blur-sm bg-neutral-950/60">
      <nav className="max-w-5xl mx-auto flex items-center gap-6 px-4 py-3" aria-label="Navegação principal">
        <Link href="/" className="text-lg font-semibold tracking-tight hover:text-emerald-400 transition-colors">DevEnigma</Link>
        <ul className="flex items-center gap-4 text-sm flex-1">
          <li><Link href="/challenges" className="hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1">Desafios</Link></li>
          <li><Link href="/ranking" className="hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1">Ranking</Link></li>
        </ul>
        <div className="flex items-center gap-3">
          <AuthActions user={user} />
        </div>
      </nav>
    </header>
  );
}
