// Requer instalação de next-auth (já declarada em package.json). Caso TS reclame,
// certifique-se de ter rodado `npm install`.
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GitHubProvider from 'next-auth/providers/github';

// Futuro: adapter Prisma será adicionado quando client estiver configurado.
// Configuração NextAuth v4 (estável) - separada para manter SRP.
// Tipos: Em alguns ambientes a exportação NextAuthOptions pode gerar falso negativo.
// Usamos inferência + comentários para manter robustez.
export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? 'missing',
      clientSecret: process.env.GITHUB_SECRET ?? 'missing'
    })
  ],
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token?.sub && session.user) {
        (session.user as Session['user'] & { id: string }).id = token.sub;
      }
      return session;
    }
  }
};
