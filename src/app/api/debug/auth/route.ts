// Rota temporária: diagnosticar configuração do NextAuth.
// Remove este arquivo após resolver o login 404.
import { NextResponse } from 'next/server';

import { authOptions } from '@core/auth/options';
import { isGitHubAuthConfigured } from '@core/auth/status';

export async function GET() {
  return NextResponse.json({
    githubAuthConfigured: isGitHubAuthConfigured(),
    registeredProviders: authOptions.providers.map(p => p.id),
    env: {
      GITHUB_ID: process.env.GITHUB_ID ? 'SET' : 'MISSING',
      GITHUB_SECRET: process.env.GITHUB_SECRET ? 'SET' : 'MISSING',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'MISSING'
    }
  });
}
