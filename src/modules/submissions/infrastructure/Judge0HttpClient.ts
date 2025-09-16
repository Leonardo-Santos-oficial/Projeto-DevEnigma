import type { Judge0Client, Judge0ExecutionRequest, Judge0ExecutionResult } from '../domain/Judge0Client';

interface Judge0SubmissionResponse {
  stdout: string | null;
  time: string | null;
  memory: number | null;
  status: { id: number; description: string };
  compile_output: string | null;
  stderr: string | null;
}

const LANGUAGE_MAP: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  'python3': 71
};

export class Judge0HttpClient implements Judge0Client {
  constructor(private readonly baseUrl: string, private readonly apiKey?: string) {}

  async execute(request: Judge0ExecutionRequest): Promise<Judge0ExecutionResult> {
    const langId = LANGUAGE_MAP[request.language.toLowerCase()];
    if (!langId) {
      throw new Error(`Linguagem não suportada para Judge0: ${request.language}`);
    }

    const cases = [] as Judge0ExecutionResult['cases'];
    let maxTime = 0;
    let maxMem = 0;

    for (const tc of request.testCases) {
      const stdout = await this.runSingle(request.code, langId, tc.input);
      const actual = stdout.stdout ?? stdout.stderr ?? stdout.compile_output ?? '';
      const passed = actual.trim() === tc.expectedOutput.trim();
      if (stdout.time) maxTime = Math.max(maxTime, parseFloat(stdout.time) * 1000);
      if (stdout.memory) maxMem = Math.max(maxMem, stdout.memory);
      cases.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: actual,
        passed,
        error: (!passed && (stdout.stderr || stdout.compile_output)) ? (stdout.stderr || stdout.compile_output || undefined) : undefined
      });
    }

    return {
      cases,
      allPassed: cases.every(c => c.passed),
      executionTimeMs: Math.round(maxTime),
      memoryKb: maxMem
    };
  }

  private async runSingle(source: string, languageId: number, stdin: string): Promise<Judge0SubmissionResponse> {
    const body = {
      source_code: source,
      language_id: languageId,
      stdin
    };

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['X-Api-Key'] = this.apiKey;

    const res = await fetch(`${this.baseUrl}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      // @ts-ignore: runtime fetch init
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Judge0 HTTP error ${res.status}: ${text}`);
    }
    return (await res.json()) as Judge0SubmissionResponse;
  }
}
