import { PrismaClient } from '@prisma/client';
import { Profile } from '../domain/Profile';
import type { ProfileRepository } from '../domain/ProfileRepository';

// NOTE: Requires `prisma generate` after adding Profile model to schema.
export class PrismaProfileRepository implements ProfileRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Profile | null> {
    // userId used as unique field (enforced via @unique in schema)
    const row = await (this.prisma as any).profile.findUnique({ where: { userId: id } });
    if (!row) return null;
  return this.mapToDomain(row);
  }

  async save(profile: Profile): Promise<void> {
    await (this.prisma as any).profile.upsert({
      where: { userId: profile.id },
      update: {
        attempts: profile.attempts,
        solved: profile.solved,
        updatedAt: profile.updatedAt,
      },
      create: {
        userId: profile.id,
        attempts: profile.attempts,
        solved: profile.solved,
      }
    });
  }

  async all(): Promise<Profile[]> {
    const rows = await (this.prisma as any).profile.findMany({ orderBy: [{ solved: 'desc' }, { attempts: 'asc' }] });
  return rows.map((r: any) => this.mapToDomain(r));
  }

  // Using 'any' row typing to stay decoupled; Prisma generates a type but we only need fields present.
  private mapToDomain(row: any): Profile {
    return Profile.restore({
      id: row.userId,
      username: row.userId, // placeholder until join with User
      solved: row.solved,
      attempts: row.attempts,
      lastSubmissionAt: row.updatedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
