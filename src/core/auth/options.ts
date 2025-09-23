// Requer instalação de next-auth (já declarada em package.json). Caso TS reclame,
// certifique-se de ter rodado `npm install`.
import type { Session, NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GitHubProvider from 'next-auth/providers/github';

import { isGitHubAuthConfigured } from './status';

// Prisma adapter só é carregado se houver DATABASE_URL definido.
let adapter: NextAuthOptions['adapter'] = undefined;
const hasDatabase = !!process.env.DATABASE_URL;
if (hasDatabase) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaAdapter } = require('@next-auth/prisma-adapter');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { prisma } = require('@core/database/prismaClient');
    adapter = PrismaAdapter(prisma);
  } catch (_err) {
    // eslint-disable-next-line no-console
    console.warn('[auth] Falha ao inicializar PrismaAdapter, prosseguindo sem OAuth (verifique dependências e DATABASE_URL)');
  }
} else {
  // eslint-disable-next-line no-console
  console.warn('[auth] DATABASE_URL ausente — OAuth GitHub requer banco para persistir contas.');
}

function warnAuthEnv() {
  const missing: string[] = [];
  const weak: string[] = [];
  const { GITHUB_ID, GITHUB_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL } = process.env;
  if (!GITHUB_ID || GITHUB_ID === 'your_github_client_id' || GITHUB_ID === 'missing') missing.push('GITHUB_ID');
  if (!GITHUB_SECRET || GITHUB_SECRET === 'your_github_client_secret' || GITHUB_SECRET === 'missing') missing.push('GITHUB_SECRET');
  if (!NEXTAUTH_URL) missing.push('NEXTAUTH_URL');
  if (!NEXTAUTH_SECRET || NEXTAUTH_SECRET === 'change_me_to_a_strong_secret' || NEXTAUTH_SECRET.length < 16) weak.push('NEXTAUTH_SECRET');
  if (missing.length || weak.length) {
    const parts: string[] = [];
    if (missing.length) parts.push(`faltando: ${missing.join(', ')}`);
    if (weak.length) parts.push(`fraca: ${weak.join(', ')}`);
    // eslint-disable-next-line no-console
    console.warn(`[auth] Config incompleta (${parts.join(' | ')}). Enquanto GITHUB_ID/GITHUB_SECRET não estiverem válidos, o link de login poderá falhar.`);
  }
}
warnAuthEnv();

// Log inicial de diagnóstico (sem expor segredos)
// eslint-disable-next-line no-console
console.log('[auth:init]', {
  hasDatabase,
  adapterLoaded: !!adapter,
  githubEnvPresent: !!process.env.GITHUB_ID && !!process.env.GITHUB_SECRET,
  nextauthUrlSet: !!process.env.NEXTAUTH_URL
});

const providers: NextAuthOptions['providers'] = [];
if (isGitHubAuthConfigured()) {
  providers.push(GitHubProvider({
    clientId: process.env.GITHUB_ID!.trim(),
    clientSecret: process.env.GITHUB_SECRET!.trim()
  }));
  if (!adapter) {
    // eslint-disable-next-line no-console
    console.warn('[auth] GitHub OAuth ativo sem adapter Prisma — contas não serão persistidas em banco. Configure DATABASE_URL para persistência.');
  }
} else {
  // eslint-disable-next-line no-console
  console.warn('[auth] GitHub OAuth não configurado (verifique GITHUB_ID/GITHUB_SECRET).');
}

export const authOptions: NextAuthOptions = {
  providers,
  adapter,
  session: { strategy: 'jwt' },
  callbacks: {
  async session({ session, token, user }: { session: Session; token: JWT; user?: { id?: string } }) {
      try {
        if (!token.sub) {
          if (user?.id) {
            token.sub = user.id;
          } else if (token.email) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { prisma } = require('@core/database/prismaClient');
            const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
            if (dbUser) token.sub = dbUser.id;
          }
        }
        if (token?.sub && session.user) {
          (session.user as Session['user'] & { id: string }).id = token.sub;
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[auth:sessionCallback] falha ao tentar garantir user.id', (e as Error).message);
      }
      return session;
    },
    async signIn({ user }) {
      if (!adapter || !user?.id) return true;
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { prisma } = require('@core/database/prismaClient');
        const existing = await prisma.profile.findUnique({ where: { userId: user.id } });
        if (!existing) {
          await prisma.profile.create({ data: { userId: user.id } });
        }
      } catch (_e) { /* noop */ }
      return true;
    }
  },
  events: {
    async signIn(message) {
      // eslint-disable-next-line no-console
      console.log('[auth:event] signIn', { userId: message?.user?.id });
    },
    async signOut() {
      // eslint-disable-next-line no-console
      console.log('[auth:event] signOut');
    }
  },
  logger: {
    error(code, metadata) { console.error('[auth:logger:error]', code, metadata); },
    warn(code) { console.warn('[auth:logger:warn]', code); },
    debug(code, metadata) { console.debug('[auth:logger:debug]', code, metadata); }
  },
  pages: { error: '/auth/error' }
};

// Futuro: adapter Prisma será adicionado quando client estiver configurado.
// Configuração NextAuth v4 (estável) - separada para manter SRP.
// Tipos: Em alguns ambientes a exportação NextAuthOptions pode gerar falso negativo.
// Usamos inferência + comentários para manter robustez.
// (Fim do arquivo) — versão consolidada do authOptions acima.
