import '@core/bootstrap';
import Link from 'next/link';

import { container, TOKENS } from '@core/di/container';
import type { ChallengeRepository } from '@modules/challenges/domain/ChallengeRepository';

export const dynamic = 'force-dynamic';

export default async function ChallengesListPage() {
  const repo = container.resolve<ChallengeRepository>(TOKENS.ChallengeRepository);
  const challenges = await repo.findAll();

  return (
    <main className="relative flex flex-col gap-6 px-6 py-6 h-[calc(100vh-0px)]">
      <div className="flex flex-col lg:flex-row lg:items-end gap-3">
        <div className="flex-1">
              <h1 className="text-3xl font-semibold tracking-tight gradient-accent-text">
            Desafios
          </h1>
          <p className="mt-1 text-sm text-neutral-300 max-w-2xl leading-relaxed">
            Escolha um desafio para praticar correção, refatoração e entendimento de código existente.
          </p>
        </div>
        <div className="text-[11px] text-neutral-500 tracking-wider">
          Total: {challenges.length}
        </div>
      </div>
      <section className="flex-1 min-h-0">
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
          {challenges.map(c => (
            <li key={c.id} className="group relative rounded border border-neutral-800/70 bg-neutral-900/60 backdrop-blur-sm p-4 flex flex-col shadow-sm shadow-black/40 hover:border-emerald-600/60 transition">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="font-medium leading-snug text-neutral-100 group-hover:text-emerald-300 transition">
                  <Link href={`/challenges/${c.id}`}>{c.title}</Link>
                </h2>
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px] uppercase tracking-wide border border-neutral-700">{c.difficulty}</span>
              </div>
              <p className="text-xs text-neutral-400 mb-4 line-clamp-3">{c.description}</p>
              <div className="mt-auto flex items-center justify-between text-[11px] text-neutral-500">
                <span className="uppercase tracking-wider">{c.language}</span>
                <Link href={`/challenges/${c.id}`} className="text-emerald-400 hover:text-emerald-300 font-medium tracking-wide">Abrir →</Link>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded bg-gradient-to-br from-emerald-400/0 via-emerald-400/0 to-emerald-400/0 opacity-0 group-hover:opacity-10 transition" />
            </li>
          ))}
          {challenges.length === 0 && (
            <li className="text-sm text-neutral-500">Nenhum desafio cadastrado.</li>
          )}
        </ul>
      </section>
      <footer className="pt-2 text-[11px] text-neutral-500 flex items-center justify-between border-t border-neutral-800/60">
        <span>DevEnigma • Challenges overview</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}