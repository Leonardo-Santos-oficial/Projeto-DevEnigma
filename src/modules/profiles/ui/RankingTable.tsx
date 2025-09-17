import React from 'react';

export interface RankingRow {
  position: number;
  username: string;
  solved: number;
  attempts: number;
  efficiency: number; // 0..1-ish fraction
}

interface Props {
  rows: RankingRow[];
  emptyLabel?: string;
}

// SRP: Apenas renderização da tabela de ranking.
// OCP: Estilização de medalhas baseada em posição; facilmente estensível.
export function RankingTable({ rows, emptyLabel = 'Nenhum perfil ainda' }: Props) {
  return (
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
          <tr><td colSpan={5} className="py-4 text-center text-neutral-400">{emptyLabel}</td></tr>
        )}
        {rows.map(r => {
          const medalClass = r.position === 1
            ? 'text-amber-300'
            : r.position === 2
              ? 'text-slate-300'
              : r.position === 3
                ? 'text-amber-600'
                : '';
          const label = r.position === 1
            ? 'Ouro'
            : r.position === 2
              ? 'Prata'
              : r.position === 3
                ? 'Bronze'
                : undefined;
          return (
            <tr key={r.position} className="border-b border-neutral-800 hover:bg-neutral-800/40 transition-colors">
              <th scope="row" className={"py-1 pr-3 font-medium " + medalClass} aria-label={label ? `${r.position}º lugar (${label})` : undefined}>
                {r.position}
              </th>
              <td className="py-1 pr-3 font-mono">{r.username || 'Anon'}</td>
              <td className="py-1 pr-3">{r.solved}</td>
              <td className="py-1 pr-3">{r.attempts}</td>
              <td className="py-1 pr-3">{r.efficiency}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
