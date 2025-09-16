import { notFound } from 'next/navigation';

import { container, TOKENS } from '@core/di/container';
import type { ChallengeRepository } from '@modules/challenges/domain/ChallengeRepository';
import '@core/bootstrap'; // side-effect: registra dependências

import { EditorClient } from './EditorClient';
import { SubmissionPanel } from '@modules/submissions/ui/SubmissionPanel';

// Evita tentativa de SSG sem DB disponível; força renderização dinâmica
export const dynamic = 'force-dynamic';

interface ChallengePageProps { params: { id: string } }

export default async function ChallengePage({ params }: ChallengePageProps) {
  const repository = container.resolve<ChallengeRepository>(TOKENS.ChallengeRepository);
  const challenge = await repository.findById(params.id);
  if (!challenge) return notFound();

  return (
    <main className="p-6 space-y-4">
      <header>
        <h1 className="text-2xl font-bold">{challenge.title}</h1>
        <p className="text-sm opacity-80">{challenge.description}</p>
      </header>
      <section className="min-h-[60vh]">
        <SubmissionPanel
          challengeId={challenge.id}
          userId="dev-user" // placeholder até autenticação
          language={challenge.language}
          initialCode={challenge.starterCode}
        />
      </section>
      <aside className="text-xs text-neutral-500">Difficulty: {challenge.difficulty}</aside>
    </main>
  );
}
