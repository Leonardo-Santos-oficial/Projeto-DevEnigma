import { notFound } from 'next/navigation';
import '@core/bootstrap';

import { container, TOKENS } from '@core/di/container';
import type { ChallengeRepository } from '@modules/challenges/domain/ChallengeRepository';
import { SubmissionPanel } from '@modules/submissions/ui/SubmissionPanel';

// Evita tentativa de SSG sem DB disponível; força renderização dinâmica
export const dynamic = 'force-dynamic';

interface ChallengePageProps { params: { id: string } }

export default async function ChallengePage({ params }: ChallengePageProps) {
  const repository = container.resolve<ChallengeRepository>(TOKENS.ChallengeRepository);
  const challenge = await repository.findById(params.id);
  if (!challenge) return notFound();

  return (
    <main className="relative flex flex-col gap-4 px-6 py-5 h-[calc(100vh-0px)]">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
        <div className="flex-1">
              <h1 className="text-3xl font-semibold tracking-tight gradient-accent-text">
                {challenge.title}
              </h1>
          <p className="mt-1 text-sm text-neutral-300 max-w-2xl leading-relaxed">
            {challenge.description}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="px-2 py-1 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">{challenge.difficulty}</span>
          <span className="px-2 py-1 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">{challenge.language}</span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <SubmissionPanel
          challengeId={challenge.id}
          userId="dev-user"
          language={challenge.language}
          initialCode={challenge.starterCode}
        />
      </div>
      <footer className="pt-2 text-[11px] text-neutral-200 flex items-center justify-between border-t border-neutral-800/60">
        <span className="font-medium text-white">DevEnigma • Improve by refactoring</span>
        <span className="text-white">Challenge ID: {challenge.id}</span>
      </footer>
    </main>
  );
}
