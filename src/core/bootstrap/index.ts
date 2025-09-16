// Composition Root - registra implementações concretas em um único ponto
// Segue DIP: camadas altas importam apenas TOKENS + container.

import { PrismaClient } from '@prisma/client';

import { loadEnv } from '@core/config/env';
import { Challenge } from '@modules/challenges/domain/Challenge';
import { InMemoryChallengeRepository } from '@modules/challenges/infrastructure/InMemoryChallengeRepository';
import { PrismaChallengeRepository } from '@modules/challenges/infrastructure/PrismaChallengeRepository';
import { InMemoryTestCaseRepository } from '@modules/challenges/infrastructure/InMemoryTestCaseRepository';
import { PrismaTestCaseRepository } from '@modules/challenges/infrastructure/PrismaTestCaseRepository';
import { InMemorySubmissionRepository } from '@modules/submissions/infrastructure/InMemorySubmissionRepository';
import { PrismaSubmissionRepository } from '@modules/submissions/infrastructure/PrismaSubmissionRepository';
import { MockJudge0Client } from '@modules/submissions/infrastructure/MockJudge0Client';
import { DefaultSubmissionService } from '@modules/submissions/domain/SubmissionService';
import { container, TOKENS } from '../di/container';

// Durante build estático (NEXT_PHASE=build) se DATABASE_URL não existir, forçamos modo in-memory
// NEXT_PHASE pode não estar definido; também checamos NODE_ENV === 'production' durante build
const isBuilding = process.env.NEXT_PHASE === 'build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL);
if (isBuilding && !process.env.DATABASE_URL) {
  process.env.USE_IN_MEMORY = 'true';
}
const env = loadEnv(!process.env.USE_IN_MEMORY);

// Prisma singleton somente se não estiver em modo in-memory
let prisma: PrismaClient | null = null;
if (env.USE_IN_MEMORY !== 'true') {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL ausente. Defina no .env ou use USE_IN_MEMORY=true');
  }
    prisma = new PrismaClient();
    container.registerSingleton('PrismaClient', prisma);
}

// Registro repositório de desafios (pode trocar entre Prisma e InMemory via flag)
const USE_IN_MEMORY = process.env.USE_IN_MEMORY === 'true';

if (USE_IN_MEMORY) {
  container.registerSingleton(
    TOKENS.ChallengeRepository,
    new InMemoryChallengeRepository([
      Challenge.create({
        id: 'hello-world',
        title: 'Hello World Fix',
        description: 'Corrija o código para imprimir Hello World corretamente.',
        starterCode: 'function main() {\n  // TODO: corrigir\n  consol.log("Hello Wrold")\n}\n',
        difficulty: 'EASY',
        language: 'javascript',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    ])
  );
} else if (!isBuilding && prisma) {
  container.registerFactory(TOKENS.ChallengeRepository, () => new PrismaChallengeRepository(prisma!));
}

// Registro TestCaseRepository
if (USE_IN_MEMORY) {
  container.registerSingleton(
    TOKENS.TestCaseRepository,
    new InMemoryTestCaseRepository([])
  );
} else if (!isBuilding && prisma) {
  container.registerFactory(TOKENS.TestCaseRepository, () => new PrismaTestCaseRepository(prisma!));
}

// Registro SubmissionRepository
if (USE_IN_MEMORY) {
  container.registerSingleton(
    TOKENS.SubmissionRepository,
    new InMemorySubmissionRepository([])
  );
} else if (!isBuilding && prisma) {
  container.registerFactory(TOKENS.SubmissionRepository, () => new PrismaSubmissionRepository(prisma!));
}

// Judge0Client (mock por enquanto)
container.registerSingleton('Judge0Client', new MockJudge0Client());

// SubmissionService (depende dos repositórios e Judge0Client)
container.registerFactory(
  TOKENS.SubmissionService,
  () => new DefaultSubmissionService(
    container.resolve(TOKENS.TestCaseRepository),
    container.resolve(TOKENS.SubmissionRepository),
    container.resolve('Judge0Client')
  )
);

export {}; // módulo sem exports públicos (side-effects apenas)
