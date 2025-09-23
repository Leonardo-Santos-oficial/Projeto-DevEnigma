import type { Judge0Client, Judge0ExecutionRequest, Judge0ExecutionResult } from '../domain/Judge0Client';

// Implementação mock determinística (SRP: simula Judge0 sem rede)
export class MockJudge0Client implements Judge0Client {
  async execute(request: Judge0ExecutionRequest): Promise<Judge0ExecutionResult> {
    // Simulação: "executa" o código avaliando simplesmente se contém todos expectedOutputs
    const cases = request.testCases.map(tc => {
      const actual = deriveOutput(request.code, tc.input);
      const passed = actual.trim() === tc.expectedOutput.trim();
      return {
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: actual,
        passed
      };
    });
    return {
      cases,
      allPassed: cases.every(c => c.passed),
      executionTimeMs: Math.round(Math.random() * 10) + 5,
      memoryKb: 32
    };
  }
}

// Função simples para derivar saída (KISS). Poderá ser substituída por execução real.
function deriveOutput(code: string, input: string): string {
  // Regras simples para melhorar previsibilidade em modo mock:
  // 1. Se contiver padrão console.log("Hello World") (tolerando espaços) => "Hello World"
  // 2. Se contiver palavra 'hello' genérica => "Hello World"
  // 3. Caso contrário: ecoa input
  const normalized = code.replace(/\s+/g, ' ');
  if (/console\.log\(\s*['"]Hello\s+World['"]\s*\)/i.test(normalized)) return 'Hello World';
  if (/hello/i.test(code)) return 'Hello World';
  return input.trim();
}
