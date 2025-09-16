// Strategy Pattern para avaliação de submissões
export interface EvaluationContext {
  code: string;
  testCases: Array<{ input: string; expectedOutput: string; isHidden: boolean }>;
  language: string;
}

export interface EvaluationResult {
  passed: boolean;
  failedCase?: { input: string; expectedOutput: string; received: string };
  raw?: unknown; // Campo flexível para detalhes (ex: logs Judge0)
}

export interface EvaluationStrategy {
  evaluate(context: EvaluationContext): Promise<EvaluationResult>;
  readonly name: string;
}

// Implementação inicial mínima (ExactMatch) - placeholder sem execução real
export class ExactMatchStrategy implements EvaluationStrategy {
  readonly name = 'ExactMatch';
  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    // Placeholder: no futuro irá chamar sandbox (Judge0) para cada test case.
    for (const tc of context.testCases) {
      // Execução fake: apenas retorna o expectedOutput simulando sucesso
      const simulatedOutput = tc.expectedOutput;
      if (simulatedOutput.trim() !== tc.expectedOutput.trim()) {
        return { passed: false, failedCase: { input: tc.input, expectedOutput: tc.expectedOutput, received: simulatedOutput } };
      }
    }
    return { passed: true };
  }
}
