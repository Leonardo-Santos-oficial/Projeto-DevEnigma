import { NextResponse } from 'next/server';

import { authOptions } from '@core/auth/options';
import { isGitHubAuthConfigured } from '@core/auth/status';

export async function GET() {
  return NextResponse.json({
    isGitHubAuthConfigured: isGitHubAuthConfigured(),
    providerCount: authOptions.providers.length,
    adapterLoaded: !!authOptions.adapter,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    githubEnvPresent: !!process.env.GITHUB_ID && !!process.env.GITHUB_SECRET,
  });
}
