import { describe, it, expect } from 'vitest';
import { diffLines, diffInline } from '../../domain/diff/diff';

describe('diffLines', () => {
  it('returns no changes for identical text', () => {
    const r = diffLines('a\nb', 'a\nb');
    expect(r.hasChanges).toBe(false);
    expect(r.segments.filter(s => s.type !== 'context')).toHaveLength(0);
  });

  it('detects additions and deletions', () => {
    const r = diffLines('a\nb\nc', 'a\nc\nd');
    const types = r.segments.map(s => s.type);
    expect(types).toContain('del');
    expect(types).toContain('add');
    expect(r.hasChanges).toBe(true);
  });
});

describe('diffInline', () => {
  it('produces inline char changes for modified line', () => {
    const line = 'console.log(1);';
    const line2 = 'console.log(12);';
    const r = diffLines(line, line2);
    const inline = diffInline(r.segments);
    const changed = inline.find(l => l.parts.some(p => p.type !== 'context'));
    expect(changed).toBeTruthy();
    const add = changed!.parts.find(p => p.type === 'add');
    expect(add?.text).toContain('2');
  });
});
