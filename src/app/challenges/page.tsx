import '@core/bootstrap';
import Link from 'next/link';

import { container, TOKENS } from '@core/di/container';
import type { ChallengeRepository } from '@modules/challenges/domain/ChallengeRepository';

export const dynamic = 'force-dynamic';

export default async function ChallengesListPage() {
  const repo = container.resolve<ChallengeRepository>(TOKENS.ChallengeRepository);
  const challenges = await repo.findAll();

  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Desafios</h1>
        <p className="text-sm text-neutral-600">Escolha um desafio para praticar correção e refatoração.</p>
      </header>
      <ul className="space-y-3">
        {challenges.map(c => (
          <li key={c.id} className="border rounded p-4 hover:bg-neutral-50 transition">
            <Link href={`/challenges/${c.id}`} className="block space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{c.title}</span>
                <span className="text-xs uppercase tracking-wide text-neutral-500">{c.difficulty}</span>
              </div>
              <p className="text-sm line-clamp-2 text-neutral-700">{c.description}</p>
            </Link>
          </li>
        ))}
        {challenges.length === 0 && (
          <li className="text-sm text-neutral-500">Nenhum desafio cadastrado.</li>
        )}
      </ul>
    </main>
  );
}