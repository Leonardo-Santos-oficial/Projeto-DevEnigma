/* eslint-disable import/order, @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { InMemoryProfileRepository } from '../infrastructure/InMemoryProfileRepository';
import { Profile } from '../domain/Profile';

function make(id: string, solved: number, attempts: number) {
  const p = Profile.createNew(id, id);
  p.solved = solved; // direct adjust for test scenario
  p.attempts = attempts;
  return p;
}

describe('Ranking ordering', () => {
  it('orders by solved desc then attempts asc then username', async () => {
    const repo = new InMemoryProfileRepository([
      make('c', 5, 40),
      make('a', 5, 20),
      make('b', 7, 70),
      make('d', 7, 65),
      make('e', 7, 65),
    ]);
    const all = await repo.all();
    const ids = all.map(p => p.id);
    // Highest solved: d/e/b (7). Among them attempts asc: d(65), e(65), b(70) then alpha d vs e -> d, e
    // Next solved group: a/c (5) attempts asc: a(20), c(40)
    expect(ids).toEqual(['d','e','b','a','c']);
  });
});
