// Composition Root
import { PrismaClient } from '@prisma/client';

import { loadEnv } from '@core/config/env';
import { logger } from '@core/logging/Logger';
import { Challenge } from '@modules/challenges/domain/Challenge';
import { TestCase } from '@modules/challenges/domain/TestCase';
import { InMemoryChallengeRepository } from '@modules/challenges/infrastructure/InMemoryChallengeRepository';
import { InMemoryTestCaseRepository } from '@modules/challenges/infrastructure/InMemoryTestCaseRepository';
import { PrismaChallengeRepository } from '@modules/challenges/infrastructure/PrismaChallengeRepository';
import { PrismaTestCaseRepository } from '@modules/challenges/infrastructure/PrismaTestCaseRepository';
import { WhitespaceCaseInsensitiveStrategy } from '@modules/submissions/domain/EvaluationStrategy';
import { DefaultSubmissionService } from '@modules/submissions/domain/SubmissionService';
import { InMemorySubmissionRepository } from '@modules/submissions/infrastructure/InMemorySubmissionRepository';
import { Judge0HttpClient } from '@modules/submissions/infrastructure/Judge0HttpClient';
import { MockJudge0Client } from '@modules/submissions/infrastructure/MockJudge0Client';
import { PrismaSubmissionRepository } from '@modules/submissions/infrastructure/PrismaSubmissionRepository';

import { container, TOKENS } from '../di/container';
container.registerSingleton('Logger', logger);

const isBuilding = process.env.NEXT_PHASE === 'build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL);
if (isBuilding && !process.env.DATABASE_URL) {
  process.env.USE_IN_MEMORY = 'true';
}
if (!isBuilding && process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL && process.env.USE_IN_MEMORY !== 'true') {
  process.env.USE_IN_MEMORY = 'true';
  logger.info('bootstrap.fallbackInMemory', { reason: 'DATABASE_URL missing in dev, forcing USE_IN_MEMORY=true' });
}
const env = loadEnv(!process.env.USE_IN_MEMORY);

let prisma: PrismaClient | null = null;
if (env.USE_IN_MEMORY !== 'true') {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL ausente. Defina no .env ou use USE_IN_MEMORY=true');
  }
    prisma = new PrismaClient();
    container.registerSingleton('PrismaClient', prisma);
}

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

if (USE_IN_MEMORY) {
  container.registerSingleton(
    TOKENS.TestCaseRepository,
    // Seed básico de test cases (inclui 1 público e 1 oculto) para o challenge hello-world
    new InMemoryTestCaseRepository([
      // Caso público: usado para feedback ao usuário
      TestCase.create({
        id: 'tc-hello-visible-1',
        input: 'ignored',
        expectedOutput: 'Hello World',
        isHidden: false,
        challengeId: 'hello-world'
      }),
      // Caso oculto: contribui para a avaliação mas não aparece na resposta
      TestCase.create({
        id: 'tc-hello-hidden-1',
        input: 'any',
        expectedOutput: 'Hello World',
        isHidden: true,
        challengeId: 'hello-world'
      })
    ])
  );
  logger.info('bootstrap.seed.testCases', { challengeId: 'hello-world', total: 2, hidden: 1 });
} else if (!isBuilding && prisma) {
  container.registerFactory(TOKENS.TestCaseRepository, () => new PrismaTestCaseRepository(prisma!));
}

if (USE_IN_MEMORY) {
  container.registerSingleton(
    TOKENS.SubmissionRepository,
    new InMemorySubmissionRepository([])
  );
} else if (!isBuilding && prisma) {
  container.registerFactory(TOKENS.SubmissionRepository, () => new PrismaSubmissionRepository(prisma!));
}

const useJudge0Mock = process.env.USE_JUDGE0_MOCK === 'true' || !env.JUDGE0_API_URL;
if (useJudge0Mock) {
  container.registerSingleton('Judge0Client', new MockJudge0Client());
} else {
  container.registerSingleton('Judge0Client', new Judge0HttpClient(env.JUDGE0_API_URL!, env.JUDGE0_API_KEY));
}

container.registerFactory(
  TOKENS.SubmissionService,
  () => new DefaultSubmissionService(
    container.resolve(TOKENS.TestCaseRepository),
    container.resolve(TOKENS.SubmissionRepository),
    container.resolve('Judge0Client'),
    new WhitespaceCaseInsensitiveStrategy(),
    container.resolve('Logger')
  )
);

export {}; // módulo sem exports públicos (side-effects apenas)
