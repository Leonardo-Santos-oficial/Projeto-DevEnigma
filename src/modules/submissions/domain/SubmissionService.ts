import type { EvaluationStrategy } from './EvaluationStrategy';
import type { Judge0Client } from './Judge0Client';
import type { SubmissionRepository } from './SubmissionRepository';
import type { TestCaseRepository } from '@modules/challenges/domain/TestCaseRepository';
import type { Logger } from '@core/logging/Logger';
import { Submission } from './Submission';
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
  cases: Array<{ input: string; expected: string; actual: string; passed: boolean }>; // ocultar hidden no futuro
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
      // Reavaliar cada caso sob a estratégia fornecendo contexto mínimo
      const reEvaluated = exec.cases.map(c => ({
        input: c.input,
        expectedOutput: c.expectedOutput,
        isHidden: false // placeholder; futuramente marcar test cases hidden
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

    return {
      submissionId: submission.id,
      status: finalStatus,
      passed: allPassed,
      cases: exec.cases.map(c => ({ input: c.input, expected: c.expectedOutput, actual: c.actualOutput, passed: c.passed }))
    };
  }
}
