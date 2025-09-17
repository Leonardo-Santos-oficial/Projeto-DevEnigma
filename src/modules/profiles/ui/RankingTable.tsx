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

// Configuração de medalhas isolada (SRP / OCP): facilita evolução (ex: adicionar ícones)
const MEDALS: Record<number, { className: string; label: string }> = {
  1: { className: 'text-amber-300', label: 'Ouro' },
  2: { className: 'text-slate-300', label: 'Prata' },
  3: { className: 'text-amber-600', label: 'Bronze' }
};


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
          const medal = MEDALS[r.position];
          return (
            <tr key={r.position} className="border-b border-neutral-800 hover:bg-neutral-800/40 transition-colors">
              <th
                scope="row"
                className={"py-1 pr-3 font-medium " + (medal?.className || '')}
                aria-label={medal ? `${r.position}º lugar (${medal.label})` : undefined}
              >
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
