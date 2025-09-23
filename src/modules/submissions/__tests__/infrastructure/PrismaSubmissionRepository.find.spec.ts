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

const makeRow = (over: Partial<{ id: string; code: string; challengeId: string; userId: string; passed: boolean; createdAt: Date; executionTime?: number|null; memoryUsage?: number|null }> = {}) => ({
  id: 's1',
  code: 'print(1)',
  challengeId: 'c1',
  userId: 'u1',
  passed: true,
  createdAt: new Date(),
  executionTime: null,
  memoryUsage: null,
  ...over
});

describe('PrismaSubmissionRepository find operations', () => {
  it('findById retorna null quando inexistente', async () => {
    const prisma = prismaMock({ findUnique: vi.fn().mockResolvedValue(null) });
    const repo = new PrismaSubmissionRepository(prisma);
    const found = await repo.findById('x');
    expect(found).toBeNull();
    expect(prisma.submission.findUnique).toHaveBeenCalledWith({ where: { id: 'x' } });
  });

  it('findById mapeia row para entidade Submission (passed true)', async () => {
    const row = makeRow({ passed: true });
    const prisma = prismaMock({ findUnique: vi.fn().mockResolvedValue(row) });
    const repo = new PrismaSubmissionRepository(prisma);
    const found = await repo.findById(row.id);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(row.id);
    expect(found?.passed).toBe(true);
    expect(found?.status).toBe(SubmissionStatus.PASSED);
  });

  it('findById mapeia row para entidade Submission (passed false)', async () => {
    const row = makeRow({ passed: false });
    const prisma = prismaMock({ findUnique: vi.fn().mockResolvedValue(row) });
    const repo = new PrismaSubmissionRepository(prisma);
    const found = await repo.findById(row.id);
    expect(found?.passed).toBe(false);
    expect(found?.status).toBe(SubmissionStatus.FAILED);
  });

  it('findRecentByUserAndChallenge retorna lista limitada e ordenada', async () => {
    const r1 = makeRow({ id: 's1', createdAt: new Date('2024-01-02T00:00:00Z') });
    const r2 = makeRow({ id: 's2', createdAt: new Date('2024-01-03T00:00:00Z') });
    const prisma = prismaMock({ findMany: vi.fn().mockResolvedValue([r2, r1]) });
    const repo = new PrismaSubmissionRepository(prisma);
    const list = await repo.findRecentByUserAndChallenge('u1','c1', 5);
    expect(list.map(s => s.id)).toEqual(['s2','s1']);
    expect(prisma.submission.findMany).toHaveBeenCalledWith({ where: { userId: 'u1', challengeId: 'c1' }, orderBy: { createdAt: 'desc' }, take: 5 });
  });

  it('save persiste campos opcionais undefined corretamente', async () => {
    const prisma = prismaMock();
    const repo = new PrismaSubmissionRepository(prisma);
    const submission = Submission.create({ id: 'z1', code: 'x', challengeId: 'c1', userId: 'u1', status: SubmissionStatus.PASSED, passed: true, createdAt: new Date(), executionTime: null, memoryUsage: null });
    await repo.save(submission);
    expect(prisma.submission.create).toHaveBeenCalledWith({
      data: {
        id: 'z1', code: 'x', challengeId: 'c1', userId: 'u1', passed: true, executionTime: undefined, memoryUsage: undefined
      }
    });
  });

  it('updateStatus define undefined quando métricas ausentes', async () => {
    const prisma = prismaMock();
    const repo = new PrismaSubmissionRepository(prisma);
    await repo.updateStatus('abc', SubmissionStatus.FAILED, false, null, null);
    expect(prisma.submission.update).toHaveBeenCalledWith({
      where: { id: 'abc' },
      data: { passed: false, executionTime: undefined, memoryUsage: undefined }
    });
  });
});
