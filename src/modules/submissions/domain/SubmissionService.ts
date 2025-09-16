import type { Logger } from '@core/logging/Logger';
import type { TestCaseRepository } from '@modules/challenges/domain/TestCaseRepository';

import type { EvaluationStrategy } from './EvaluationStrategy';
import type { Judge0Client } from './Judge0Client';
import { Submission } from './Submission';
import type { SubmissionRepository } from './SubmissionRepository';
import { SubmissionStatus } from './SubmissionStatus';

export interface CreateSubmissionInput {
  code: string;
  challengeId: string;
  userId: string;
  language: string;
}

export interface SubmissionResultView {
  submissionId: string;
  status: SubmissionStatus;
  passed: boolean;
  // Apenas casos NÃO ocultos retornados para feedback ao usuário.
  cases: Array<{ input: string; expected: string; actual: string; passed: boolean }>; 
}

export interface SubmissionService {
  submit(input: CreateSubmissionInput): Promise<SubmissionResultView>;
}

// Serviço orquestrador (SRP: fluxo de submissão). Abstrações injetadas (DIP).
export class DefaultSubmissionService implements SubmissionService {
  constructor(
    private readonly testCaseRepo: TestCaseRepository,
    private readonly submissionRepo: SubmissionRepository,
    private readonly judge0: Judge0Client,
    private readonly strategy: EvaluationStrategy | undefined,
    private readonly logger: Logger
  ) {}

  async submit(input: CreateSubmissionInput): Promise<SubmissionResultView> {
  const start = Date.now();
  this.logger.info('submission.start', { challengeId: input.challengeId, language: input.language });
  const testCases = await this.testCaseRepo.findByChallengeId(input.challengeId);
    if (testCases.length === 0) throw new Error('Nenhum caso de teste para o desafio.');

    const submission = Submission.create({
      id: crypto.randomUUID(),
      code: input.code,
      challengeId: input.challengeId,
      userId: input.userId,
      status: SubmissionStatus.PENDING,
      passed: false,
      createdAt: new Date()
    });
    await this.submissionRepo.save(submission);

    // Executa (mock) - no futuro poderemos enfileirar e retornar status PENDING imediatamente.
    const exec = await this.judge0.execute({
      code: input.code,
      language: input.language,
      testCases: testCases.map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput }))
    });

    // Se houver strategy, recalcula passed com base nela (normalização tolerante etc.)
    let allPassed = exec.allPassed;
    if (this.strategy) {
      // Reavaliar cada caso sob a estratégia, preservando metadados de visibilidade
      const reEvaluated = testCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden
      }));
      // A strategy atual usa expectedOutput diretamente como "simulatedOutput" pois execução já ocorreu;
      // manteremos compat até Strategy evoluir para receber outputs reais.
      const stratResult = await this.strategy.evaluate({
        code: input.code,
        language: input.language,
        testCases: reEvaluated
      });
      allPassed = stratResult.passed && exec.cases.every(c => c.passed);
    }

    const finalStatus = allPassed ? SubmissionStatus.PASSED : SubmissionStatus.FAILED;
    await this.submissionRepo.updateStatus(submission.id, finalStatus, allPassed, exec.executionTimeMs, exec.memoryKb);
    this.logger.info('submission.finish', {
      submissionId: submission.id,
      status: finalStatus,
      durationMs: Date.now() - start,
      passed: allPassed,
      cases: exec.cases.length
    });

    // Filtra casos ocultos da resposta (cumpre princípio de não expor critérios completos).
    const publicCases = testCases
      .map((tc, i) => ({ meta: tc, exec: exec.cases[i] }))
      .filter(pair => !pair.meta.isHidden)
      .map(pair => ({
        input: pair.exec.input,
        expected: pair.exec.expectedOutput,
        actual: pair.exec.actualOutput,
        passed: pair.exec.passed
      }));

    return {
      submissionId: submission.id,
      status: finalStatus,
      passed: allPassed,
      cases: publicCases
    };
  }
}
