import type { Judge0Client, Judge0ExecutionRequest, Judge0ExecutionResult } from '../domain/Judge0Client';

interface HttpClientOptions { timeoutMs?: number; maxRetries?: number }

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

const DEFAULT_TIMEOUT = Number(process.env.JUDGE0_REQUEST_TIMEOUT_MS || 8000);
const DEFAULT_RETRIES = Number(process.env.JUDGE0_MAX_RETRIES || 1);

enum Judge0StatusId {
  Accepted = 3,
  WrongAnswer = 4,
  TimeLimitExceeded = 5,
  CompilationError = 6,
  RuntimeError = 7
}

function classifyStatus(id: number): string {
  switch (id) {
    case Judge0StatusId.Accepted: return 'OK';
    case Judge0StatusId.WrongAnswer: return 'WA';
    case Judge0StatusId.TimeLimitExceeded: return 'TLE';
    case Judge0StatusId.CompilationError: return 'CE';
    case Judge0StatusId.RuntimeError: return 'RE';
    default: return 'OTHER';
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms))
  ]);
}

export class Judge0HttpClient implements Judge0Client {
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  constructor(private readonly baseUrl: string, private readonly apiKey?: string, opts?: HttpClientOptions) {
    this.timeoutMs = opts?.timeoutMs ?? DEFAULT_TIMEOUT;
    this.maxRetries = opts?.maxRetries ?? DEFAULT_RETRIES;
  }

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
      const rawActual = stdout.stdout ?? stdout.stderr ?? stdout.compile_output ?? '';
      const actual = rawActual.replace(/\r/g, '').replace(/\n+$/, '');
      const statusCode = classifyStatus(stdout.status.id);
      const passed = statusCode === 'OK' && actual.trim() === tc.expectedOutput.trim();
      if (stdout.time) maxTime = Math.max(maxTime, parseFloat(stdout.time) * 1000);
      if (stdout.memory) maxMem = Math.max(maxMem, stdout.memory);
      const errorDetail = passed ? undefined : (stdout.stderr || stdout.compile_output || stdout.status.description);
      cases.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: actual,
        passed,
        error: errorDetail
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

    let attempt = 0;
    while (attempt < this.maxRetries + 1) {
      attempt++;
      try {
        const res = await withTimeout(fetch(`${this.baseUrl}/submissions?base64_encoded=false&wait=true`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        }), this.timeoutMs);
        if (!res.ok) {
          const text = await res.text();
            if (res.status >= 500 && attempt <= this.maxRetries) continue;
          throw new Error(`Judge0 HTTP error ${res.status}: ${text}`);
        }
        return await res.json() as Judge0SubmissionResponse;
      } catch (err: unknown) {
        const msg = typeof err === 'object' && err && 'message' in err ? String((err as { message?: unknown }).message) : '';
        if (/Timeout/.test(msg) && attempt <= this.maxRetries) continue;
        throw err;
      }
    }
    // Should never reach here due to return inside loop; safeguard for type system
    throw new Error('Judge0 submission failed after maximum retries');
  }
}
