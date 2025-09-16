import type { EvaluationStrategy } from './EvaluationStrategy';
import type { Judge0Client } from './Judge0Client';
import type { SubmissionRepository } from './SubmissionRepository';
import type { TestCaseRepository } from '@modules/challenges/domain/TestCaseRepository';
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
    private readonly strategy?: EvaluationStrategy // placeholder para futuras estratégias
  ) {}

  async submit(input: CreateSubmissionInput): Promise<SubmissionResultView> {
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

    const finalStatus = exec.allPassed ? SubmissionStatus.PASSED : SubmissionStatus.FAILED;
    await this.submissionRepo.updateStatus(submission.id, finalStatus, exec.allPassed, exec.executionTimeMs, exec.memoryKb);

    return {
      submissionId: submission.id,
      status: finalStatus,
      passed: exec.allPassed,
      cases: exec.cases.map(c => ({ input: c.input, expected: c.expectedOutput, actual: c.actualOutput, passed: c.passed }))
    };
  }
}
