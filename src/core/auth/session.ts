import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';

import { authOptions } from './options';

// Tipagem defensiva: NextAuth v4 retorna Session | null.
type ExtendedUser = Session['user'] & { id?: string };
type MaybeSession = (Session & { user?: ExtendedUser }) | null;

export async function getCurrentSession(): Promise<MaybeSession> {
  return getServerSession(authOptions) as Promise<MaybeSession>;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export async function getCurrentUserId() {
  const user = await getCurrentUser();
  if (user && 'id' in user && user.id) return user.id;
  return null;
}