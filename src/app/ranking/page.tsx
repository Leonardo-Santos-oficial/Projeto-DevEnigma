import '@core/bootstrap';
import { container, TOKENS } from '@core/di/container';

export const revalidate = 30;

export default async function RankingPage() {
  const repo = container.resolve<any>(TOKENS.ProfileRepository);
  const profiles = await repo.all();
  const rows = profiles.map((p: any, i: number) => ({
    pos: i + 1,
    username: p.username,
    solved: p.solved,
    attempts: p.attempts,
    efficiency: p.solved === 0 ? 0 : +(p.solved / p.attempts).toFixed(2)
  }));

  return (
  <main className="relative z-10 p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Ranking Global</h1>
      <table className="w-full text-sm border-collapse" aria-label="Tabela de ranking">
        <caption className="sr-only">Ranking de usuários por desafios resolvidos</caption>
        <thead>
          <tr className="text-left border-b border-neutral-700">
            <th scope="col" className="py-2 pr-3">#</th>
            <th scope="col" className="py-2 pr-3">Usuário</th>
            <th scope="col" className="py-2 pr-3">Resolvidos</th>
            <th scope="col" className="py-2 pr-3">Submissões</th>
            <th scope="col" className="py-2 pr-3">Eficiência</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={5} className="py-4 text-center text-neutral-400">Nenhum perfil ainda</td></tr>
          )}
          {rows.map((r: { pos: number; username: string; solved: number; attempts: number; efficiency: number }) => (
            <tr key={r.pos} className="border-b border-neutral-800 hover:bg-neutral-800/40 transition-colors">
              <th scope="row" className="py-1 pr-3 font-medium">{r.pos}</th>
              <td className="py-1 pr-3 font-mono">{r.username}</td>
              <td className="py-1 pr-3">{r.solved}</td>
              <td className="py-1 pr-3">{r.attempts}</td>
              <td className="py-1 pr-3">{r.efficiency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
