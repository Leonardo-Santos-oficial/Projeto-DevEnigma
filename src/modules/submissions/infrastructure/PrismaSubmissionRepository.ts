import type { PrismaClient } from '@prisma/client';

import { Submission } from '../domain/Submission';
import type { SubmissionRepository } from '../domain/SubmissionRepository';
import { SubmissionStatus } from '../domain/SubmissionStatus';

export class PrismaSubmissionRepository implements SubmissionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string) {
    const row = await this.prisma.submission.findUnique({ where: { id } });
    if (!row) return null;
    return Submission.create({
      id: row.id,
      code: row.code,
      challengeId: row.challengeId,
      userId: row.userId,
      status: row.passed ? SubmissionStatus.PASSED : SubmissionStatus.FAILED, // status simplificado (não temos coluna status ainda)
      passed: row.passed,
      executionTime: row.executionTime ?? null,
      memoryUsage: row.memoryUsage ?? null,
      createdAt: row.createdAt
    });
  }

  async findRecentByUserAndChallenge(userId: string, challengeId: string, limit: number) {
    const rows = await this.prisma.submission.findMany({
      where: { userId, challengeId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    return rows.map(r => Submission.create({
      id: r.id,
      code: r.code,
      challengeId: r.challengeId,
      userId: r.userId,
      status: r.passed ? SubmissionStatus.PASSED : SubmissionStatus.FAILED,
      passed: r.passed,
      executionTime: r.executionTime ?? null,
      memoryUsage: r.memoryUsage ?? null,
      createdAt: r.createdAt
    }));
  }

  async save(submission: Submission) {
    await this.prisma.submission.create({
      data: {
        id: submission.id,
        code: submission.code,
        challengeId: submission.challengeId,
        userId: submission.userId,
        passed: submission.passed,
        executionTime: submission.executionTime ?? undefined,
        memoryUsage: submission.memoryUsage ?? undefined
      }
    });
  }

  async updateStatus(id: string, status: SubmissionStatus, passed: boolean, executionTime?: number | null, memoryUsage?: number | null) {
    await this.prisma.submission.update({
      where: { id },
      data: {
        passed,
        executionTime: executionTime ?? undefined,
        memoryUsage: memoryUsage ?? undefined
      }
    });
  }
}
