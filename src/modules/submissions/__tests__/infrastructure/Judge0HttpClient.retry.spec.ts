import { describe, it, expect, vi } from 'vitest';
import { Judge0HttpClient } from '../../infrastructure/Judge0HttpClient';

// Helper para mockar fetch em cada chamada
function mockFetchSequence(responses: Array<() => Promise<Response> | Response>) {
  const fn = vi.fn();
  responses.forEach(r => fn.mockImplementationOnce(r as any));
  // fallback se mais chamadas
  fn.mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ stdout: 'ignored', time: '0.01', memory: 10, status: { id: 3, description: 'Accepted' }, compile_output: null, stderr: null }), { status: 200 } as any)));
  (global as any).fetch = fn;
  return fn;
}

describe('Judge0HttpClient retry & timeout', () => {
  it('retries on 500 and succeeds', async () => {
    const seq = mockFetchSequence([
      () => Promise.resolve(new Response('err', { status: 500 }) as any),
      () => Promise.resolve(new Response(JSON.stringify({ stdout: 'OK', time: '0.01', memory: 10, status: { id: 3, description: 'Accepted' }, compile_output: null, stderr: null }), { status: 200 }) as any)
    ]);
    const client = new Judge0HttpClient('http://fake', undefined, { timeoutMs: 200, maxRetries: 2 });
    const res = await client.execute({ code: 'print()', language: 'python', testCases: [{ input: '', expectedOutput: 'OK' }] });
    expect(res.cases[0].passed).toBe(true);
    expect(seq).toHaveBeenCalledTimes(2);
  });

  it('fails after retries exhausted', async () => {
    const seq = mockFetchSequence([
      () => Promise.resolve(new Response('err', { status: 500 }) as any),
      () => Promise.resolve(new Response('err', { status: 500 }) as any),
      () => Promise.resolve(new Response('err', { status: 500 }) as any)
    ]);
    const client = new Judge0HttpClient('http://fake', undefined, { timeoutMs: 100, maxRetries: 1 });
    await expect(client.execute({ code: 'print()', language: 'python', testCases: [{ input: '', expectedOutput: 'OK' }] })).rejects.toThrow(/HTTP error 500/);
    expect(seq).toHaveBeenCalledTimes(2); // tentativa inicial + 1 retry
  });

  it('retries on timeout then succeeds', async () => {
    const seq = mockFetchSequence([
      () => new Promise((resolve) => setTimeout(() => resolve(new Response(JSON.stringify({ stdout: 'LATE', time: '0.01', memory: 10, status: { id: 3, description: 'Accepted' }, compile_output: null, stderr: null }), { status: 200 }) as any), 150)),
      () => Promise.resolve(new Response(JSON.stringify({ stdout: 'OK', time: '0.01', memory: 10, status: { id: 3, description: 'Accepted' }, compile_output: null, stderr: null }), { status: 200 }) as any)
    ]);
    const client = new Judge0HttpClient('http://fake', undefined, { timeoutMs: 50, maxRetries: 2 });
    const res = await client.execute({ code: 'print()', language: 'python', testCases: [{ input: '', expectedOutput: 'OK' }] });
    expect(res.cases[0].actualOutput).toBe('OK');
    expect(seq).toHaveBeenCalledTimes(2);
  });
});
