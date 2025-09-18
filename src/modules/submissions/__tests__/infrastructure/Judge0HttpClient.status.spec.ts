/* eslint-disable import/order, @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { Judge0HttpClient } from '../../infrastructure/Judge0HttpClient';

function mockOnce(payload: any, status = 200) {
  (global as any).fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
    text: async () => JSON.stringify(payload)
  });
}

describe('Judge0HttpClient status classification', () => {
  it('handles compilation error', async () => {
    mockOnce({ stdout: null, stderr: null, compile_output: 'Syntax error', time: '0.01', memory: 10, status: { id: 6, description: 'Compilation error' } });
    const client = new Judge0HttpClient('http://fake');
    const result = await client.execute({ code: 'bad code', language: 'python', testCases: [{ input: '', expectedOutput: '' }] });
    expect(result.cases[0].passed).toBe(false);
    expect(result.cases[0].error).toMatch(/Syntax error|Compilation/);
  });

  it('handles runtime error', async () => {
    mockOnce({ stdout: null, stderr: 'Runtime crash', compile_output: null, time: '0.01', memory: 10, status: { id: 7, description: 'Runtime error' } });
    const client = new Judge0HttpClient('http://fake');
    const result = await client.execute({ code: 'crash', language: 'python', testCases: [{ input: '', expectedOutput: '' }] });
    expect(result.cases[0].passed).toBe(false);
    expect(result.cases[0].error).toContain('Runtime crash');
  });
});
