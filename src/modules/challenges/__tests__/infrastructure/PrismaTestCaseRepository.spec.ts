/* eslint-disable import/order */
import { describe, it, expect, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { PrismaTestCaseRepository } from '@modules/challenges/infrastructure/PrismaTestCaseRepository';
import { TestCase } from '@modules/challenges/domain/TestCase';

function createPrismaMock(overrides: Partial<PrismaClient['testCase']> = {}, extra: any = {}) {
  return {
    testCase: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
      ...overrides
    },
    $transaction: vi.fn(async (ops: any[]) => { await Promise.all(ops.map(o => o)); })
    , ...extra
  } as unknown as PrismaClient;
}

describe('PrismaTestCaseRepository', () => {
  it('findByChallengeId retorna lista mapeada', async () => {
    const prisma = createPrismaMock({ findMany: vi.fn().mockResolvedValue([
      { id: 't1', input: '1', expectedOutput: '1', isHidden: false, challengeId: 'c1' }
    ]) });
    const repo = new PrismaTestCaseRepository(prisma);
    const list = await repo.findByChallengeId('c1');
    expect(list).toHaveLength(1);
    expect(prisma.testCase.findMany).toHaveBeenCalledWith({ where: { challengeId: 'c1' } });
  });

  it('saveMany executa transação delete + createMany', async () => {
    const prisma = createPrismaMock();
    const repo = new PrismaTestCaseRepository(prisma);
    const tc = TestCase.create({ id: 't1', input: 'i', expectedOutput: 'o', isHidden: false, challengeId: 'c1' });
    await repo.saveMany([tc]);
    expect(prisma.testCase.deleteMany).toHaveBeenCalledWith({ where: { challengeId: 'c1' } });
    expect(prisma.testCase.createMany).toHaveBeenCalled();
  });
});
