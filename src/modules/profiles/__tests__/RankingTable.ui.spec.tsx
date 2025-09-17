import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { RankingTable } from '../ui/RankingTable';

describe('RankingTable UI', () => {
  it('renders headers and medals for top 3', () => {
    render(<RankingTable rows={[
      { position: 1, username: 'user1', solved: 10, attempts: 12, efficiency: 0.83 },
      { position: 2, username: 'user2', solved: 8, attempts: 10, efficiency: 0.8 },
      { position: 3, username: 'user3', solved: 7, attempts: 9, efficiency: 0.78 },
      { position: 4, username: 'user4', solved: 2, attempts: 5, efficiency: 0.4 },
    ]} />);

    expect(screen.getByRole('columnheader', { name: /usuário/i })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: /1º lugar/i })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: /2º lugar/i })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: /3º lugar/i })).toBeTruthy();
  });

  it('shows fallback when empty', () => {
    render(<RankingTable rows={[]} emptyLabel="Nada ainda" />);
    expect(screen.getByText(/Nada ainda/)).toBeTruthy();
  });
});
