'use client';
import { signIn, signOut } from 'next-auth/react';
import React from 'react';

interface AuthActionsProps {
  user: { name?: string | null; image?: string | null; id?: string } | null;
}

export function AuthActions({ user }: AuthActionsProps) {
  if (!user) {
    return (
      <button
        onClick={() => signIn('github')}
        className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:ring-offset-2 focus:ring-offset-neutral-900"
      >Login GitHub</button>
    );
  }
  return (
    <div className="flex items-center gap-3">
      {user.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.image} alt={user.name ?? 'avatar'} className="h-8 w-8 rounded-full border border-neutral-700 object-cover" />
      )}
      <span className="text-sm text-neutral-200 max-w-[140px] truncate" title={user.name ?? user.id}>{user.name ?? user.id}</span>
      <button
        onClick={() => signOut()}
        className="px-2 py-1 rounded border border-neutral-600 text-neutral-300 hover:text-white hover:border-emerald-500 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:ring-offset-2 focus:ring-offset-neutral-900"
      >Sair</button>
    </div>
  );
}
