import '../../core/bootstrap';
import { NextResponse } from 'next/server';

import { container, TOKENS } from '@core/di/container';
import type { Profile } from '@modules/profiles/domain/Profile';

export const revalidate = 30; // incremental revalidation

export async function GET() {
  const repo = container.resolve<{ all(): Promise<Profile[]> }>(TOKENS.ProfileRepository);
  const profiles = await repo.all();
  const data = profiles.map((p, idx: number) => ({
    position: idx + 1,
    userId: p.id,
    username: p.username || 'Anon',
    solved: p.solved,
    attempts: p.attempts,
    efficiency: p.attempts === 0 ? 0 : +(p.solved / p.attempts).toFixed(2),
  }));
  return NextResponse.json({ ranking: data, updatedAt: new Date().toISOString() });
}
