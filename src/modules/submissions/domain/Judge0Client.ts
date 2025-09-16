export interface Judge0ExecutionRequest {
  code: string;
  language: string;
  testCases: { input: string; expectedOutput: string }[];
}

export interface Judge0ExecutionResultCase {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
}

export interface Judge0ExecutionResult {
  cases: Judge0ExecutionResultCase[];
  allPassed: boolean;
  executionTimeMs?: number;
  memoryKb?: number;
}

export interface Judge0Client {
  execute(request: Judge0ExecutionRequest): Promise<Judge0ExecutionResult>;
}
