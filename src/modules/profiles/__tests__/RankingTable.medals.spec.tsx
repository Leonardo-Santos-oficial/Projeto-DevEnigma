import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import { RankingTable, DEFAULT_MEDALS } from '../ui/RankingTable';
import type { MedalConfig } from '../ui/RankingTable';

function extractRowHeader(position: number) {
  return screen.getByRole('rowheader', { name: new RegExp(`^${position}º`, 'i') });
}

describe('RankingTable medal mapping', () => {
  const baseRows = [
    { position: 1, username: 'a', solved: 5, attempts: 6, efficiency: 0.83 },
    { position: 2, username: 'b', solved: 4, attempts: 5, efficiency: 0.8 },
    { position: 3, username: 'c', solved: 3, attempts: 4, efficiency: 0.75 },
    { position: 4, username: 'd', solved: 1, attempts: 3, efficiency: 0.33 }
  ];

  it('aplica classes e aria-label padrão para top 3', () => {
    render(<RankingTable rows={baseRows} />);

    [1,2,3].forEach(pos => {
      const cell = extractRowHeader(pos);
      const medal = DEFAULT_MEDALS[pos];
      if (!medal) throw new Error('Medal config ausente');
      expect(cell).toHaveAttribute('aria-label', `${pos}º lugar (${medal.label})`);
      if (medal.className) expect(cell.className).toContain(medal.className);
    });

    // posição 4 não deve ter aria-label de medalha
    const cell4 = screen.getByRole('rowheader', { name: '4' });
    expect(cell4.getAttribute('aria-label')).toBeNull();
  });

  it('permite sobrescrever mapa de medalhas via prop', () => {
    const custom: Record<number, MedalConfig> = {
      1: { className: 'text-pink-400', label: 'Ruby' },
      2: { className: 'text-indigo-300', label: 'Sapphire' }
    };

    render(<RankingTable rows={baseRows} medalsMap={custom} />);
    const first = extractRowHeader(1);
    expect(first).toHaveAttribute('aria-label', '1º lugar (Ruby)');
    expect(first.className).toContain('text-pink-400');

    const second = extractRowHeader(2);
    expect(second).toHaveAttribute('aria-label', '2º lugar (Sapphire)');
    expect(second.className).toContain('text-indigo-300');

    // posição 3 agora não recebe medalha pois não está no custom map
    const third = screen.getByRole('rowheader', { name: '3' });
    expect(third.getAttribute('aria-label')).toBeNull();
  });
});
