import '../../core/bootstrap';
import { NextResponse } from 'next/server';
import { container, TOKENS } from '@core/di/container';

export const revalidate = 30; // incremental revalidation

export async function GET() {
  const repo = container.resolve<any>(TOKENS.ProfileRepository);
  const profiles = await repo.all();
  const data = profiles.map((p: any, idx: number) => ({
    position: idx + 1,
    userId: p.id,
    username: p.username || 'Anon',
    solved: p.solved,
    attempts: p.attempts,
    efficiency: p.attempts === 0 ? 0 : +(p.solved / p.attempts).toFixed(2),
  }));
  return NextResponse.json({ ranking: data, updatedAt: new Date().toISOString() });
}
