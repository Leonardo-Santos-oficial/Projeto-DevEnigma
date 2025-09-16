import type { DefaultSession } from 'next-auth';

// Augmentação do tipo Session para incluir user.id
// Mantém SRP: apenas responsabilidade de tipos de auth.

declare module 'next-auth' {
  interface Session {
    user?: {
      id: string;
    } & DefaultSession['user'];
  }
}
