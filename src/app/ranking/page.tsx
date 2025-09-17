import '@core/bootstrap';
import { container, TOKENS } from '@core/di/container';
import { RankingTable } from '@modules/profiles/ui/RankingTable';

export const revalidate = 30;

export default async function RankingPage() {
  const repo = container.resolve<any>(TOKENS.ProfileRepository);
  const profiles = await repo.all();
  const rows = profiles.map((p: any, i: number) => ({
    position: i + 1,
    username: p.username || 'Anon',
    solved: p.solved,
    attempts: p.attempts,
    efficiency: p.attempts === 0 ? 0 : +(p.solved / p.attempts).toFixed(2)
  }));

  return (
    <main className="relative z-10 p-6 max-w-4xl mx-auto">
      <div className="bg-neutral-950/70 backdrop-blur-sm rounded-lg border border-neutral-800/60 p-6 shadow-lg">
        <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <span>Ranking Global</span>
          <span className="text-xs font-normal text-neutral-400">Eficiência = resolvidos / tentativas</span>
        </h1>
        <RankingTable rows={rows} />
      </div>
    </main>
  );
}
