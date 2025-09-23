import { NextResponse } from 'next/server';

import { getCurrentSession } from '@core/auth/session';

export async function GET() {
  const session = await getCurrentSession();
  return NextResponse.json({ hasSession: !!session, user: session?.user || null });
}
