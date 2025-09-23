/* eslint-disable import/order */
import { describe, it, expect, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { PrismaSubmissionRepository } from '@modules/submissions/infrastructure/PrismaSubmissionRepository';
import { Submission } from '@modules/submissions/domain/Submission';
import { SubmissionStatus } from '@modules/submissions/domain/SubmissionStatus';

function prismaMock(overrides: Partial<PrismaClient['submission']> = {}) {
  return {
    submission: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      ...overrides
    }
  } as unknown as PrismaClient;
}

describe('PrismaSubmissionRepository', () => {
  it('save cria submissão', async () => {
    const prisma = prismaMock();
    const repo = new PrismaSubmissionRepository(prisma);
    const sub = Submission.create({ id: 's1', code: 'code', challengeId: 'c1', userId: 'u1', status: SubmissionStatus.PASSED, passed: true, executionTime: null, memoryUsage: null, createdAt: new Date() });
    await repo.save(sub);
    expect(prisma.submission.create).toHaveBeenCalled();
  });

  it('updateStatus atualiza campos', async () => {
    const prisma = prismaMock();
    const repo = new PrismaSubmissionRepository(prisma);
    await repo.updateStatus('s1', SubmissionStatus.FAILED, false, 10, 256);
    expect(prisma.submission.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: { passed: false, executionTime: 10, memoryUsage: 256 }
    });
  });
});
