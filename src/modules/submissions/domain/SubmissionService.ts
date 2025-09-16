import type { EvaluationStrategy } from './EvaluationStrategy';

export interface SubmissionInput {
  challengeId: string;
  userId: string;
  code: string;
  language: string;
}

export interface SubmissionOutcome {
  passed: boolean;
  executionTime?: number;
  memoryUsage?: number;
  failedCase?: { input: string; expectedOutput: string; received: string };
}

export interface SubmissionService {
  submit(input: SubmissionInput): Promise<SubmissionOutcome>;
  readonly strategyName: string;
}

export class DefaultSubmissionService implements SubmissionService {
  constructor(private readonly strategy: EvaluationStrategy) {}

  get strategyName() { return this.strategy.name; }

  async submit(input: SubmissionInput): Promise<SubmissionOutcome> {
    // TODO: obter test cases via ChallengeRepository, executar Strategy real
    // Uso mínimo do parâmetro para evitar warning de variável não utilizada
    void input.challengeId;
    return { passed: true };
  }
}
