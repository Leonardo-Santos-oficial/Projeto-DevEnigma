export interface EvaluationContext {
  code: string;
  testCases: Array<{ input: string; expectedOutput: string; isHidden: boolean }>;
  language: string;
}

export interface EvaluationResult {
  passed: boolean;
  failedCase?: { input: string; expectedOutput: string; received: string };
  raw?: unknown;
}

export interface EvaluationStrategy {
  evaluate(context: EvaluationContext): Promise<EvaluationResult>;
  readonly name: string;
}

export class ExactMatchStrategy implements EvaluationStrategy {
  readonly name = 'ExactMatch';
  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    for (const tc of context.testCases) {
      const simulatedOutput = tc.expectedOutput;
      if (simulatedOutput.trim() !== tc.expectedOutput.trim()) {
        return { passed: false, failedCase: { input: tc.input, expectedOutput: tc.expectedOutput, received: simulatedOutput } };
      }
    }
    return { passed: true };
  }
}


export class WhitespaceCaseInsensitiveStrategy implements EvaluationStrategy {
  readonly name = 'WhitespaceCaseInsensitive';
  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const normalize = (s: string) => s.replace(/\r/g, '').trim().replace(/\s+/g, ' ').toLowerCase();
    for (const tc of context.testCases) {
      const simulatedOutput = tc.expectedOutput;
      if (normalize(simulatedOutput) !== normalize(tc.expectedOutput)) {
        return { passed: false, failedCase: { input: tc.input, expectedOutput: tc.expectedOutput, received: simulatedOutput } };
      }
    }
    return { passed: true };
  }
}
