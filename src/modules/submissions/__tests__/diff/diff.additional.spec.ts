/* eslint-disable import/order, @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { diffLines } from '../../domain/diff/diff';

describe('diffLines additional cases', () => {
  it('empty vs content', () => {
    const r = diffLines('', 'A\nB');
    const types = r.segments.map(s => s.type);
    expect(types.every(t => t === 'add')).toBe(true);
  });

  it('content vs empty', () => {
    const r = diffLines('A\nB', '');
    const types = r.segments.map(s => s.type);
    expect(types.every(t => t === 'del')).toBe(true);
  });

  it('only insertion at beginning', () => {
    const r = diffLines('B\nC', 'A\nB\nC');
    // first line should be add then contexts
    expect(r.segments[0].type).toBe('add');
  });

  it('only insertion at end', () => {
    const r = diffLines('A\nB', 'A\nB\nC');
    expect(r.segments[r.segments.length - 1]).toMatchObject({ type: 'add', value: 'C' });
  });
});
