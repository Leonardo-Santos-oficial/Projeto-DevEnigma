import { describe, expect, it } from 'vitest';

import { TestCase } from '../domain/TestCase';
import { InMemoryTestCaseRepository } from '../infrastructure/InMemoryTestCaseRepository';

function make(id: string, challengeId: string) {
  return TestCase.create({ id, input: '1 2', expectedOutput: '3', isHidden: false, challengeId });
}

describe('InMemoryTestCaseRepository', () => {
  it('retorna test cases por challenge', async () => {
    const repo = new InMemoryTestCaseRepository([
      make('a', 'c1'),
      make('b', 'c1'),
      make('c', 'c2')
    ]);
    const list = await repo.findByChallengeId('c1');
    expect(list).toHaveLength(2);
  });

  it('substitui test cases ao salvar array de mesmo challenge', async () => {
    const repo = new InMemoryTestCaseRepository([
      make('a', 'c1'),
      make('b', 'c1')
    ]);
    await repo.saveMany([make('x', 'c1')]);
    const list = await repo.findByChallengeId('c1');
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('x');
  });
});
