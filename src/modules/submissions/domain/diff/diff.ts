// Lightweight diff utilities (line + intra-line) without external deps.
// Goals: stable ordering, minimal objects, suitable for small code outputs.

export interface DiffSegment {
  type: 'context' | 'add' | 'del';
  value: string; // the line content (without trailing newline)
}

export interface LineDiffResult {
  segments: DiffSegment[];
  hasChanges: boolean;
}

// Myers diff (O(ND)) simplified for line diff; optimized for short outputs.
export function diffLines(a: string, b: string): LineDiffResult {
  if (a === b) return { segments: a === '' ? [] : a.split(/\n/).map(l => ({ type: 'context' as const, value: l })), hasChanges: false };
  const aLines = a.replace(/\r/g, '').split(/\n/);
  const bLines = b.replace(/\r/g, '').split(/\n/);
  const N = aLines.length; const M = bLines.length;
  const max = N + M;
  const v: Record<number, number> = { 1: 0 };
  const trace: Record<number, Record<number, number>> = {};
  for (let d = 0; d <= max; d++) {
    trace[d] = { ...v };
    for (let k = -d; k <= d; k += 2) {
      let x: number;
      if (k === -d || (k !== d && v[k - 1] < v[k + 1])) {
        x = v[k + 1];
      } else {
        x = v[k - 1] + 1;
      }
      let y = x - k;
      while (x < N && y < M && aLines[x] === bLines[y]) { x++; y++; }
      v[k] = x;
      if (x >= N && y >= M) {
        return buildSegments(aLines, bLines, trace, d, k);
      }
    }
  }
  return { segments: [], hasChanges: true }; // unreachable ideally
}

function buildSegments(aLines: string[], bLines: string[], trace: Record<number, Record<number, number>>, d: number, k: number): LineDiffResult {
  const segments: DiffSegment[] = [];
  let x = aLines.length; let y = bLines.length;
  for (let depth = d; depth > 0; depth--) {
    const v = trace[depth];
    let prevK: number;
    if (k === -depth || (k !== depth && v[k - 1] < v[k + 1])) {
      prevK = k + 1; // insertion
    } else {
      prevK = k - 1; // deletion
    }
    const prevX = v[prevK];
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) {
      // matching line
      segments.push({ type: 'context', value: aLines[x - 1] });
      x--; y--;
    }
    if (x === prevX) {
      // insertion (add bLines[prevY])
      segments.push({ type: 'add', value: bLines[prevY] });
    } else {
      // deletion (del aLines[prevX])
      segments.push({ type: 'del', value: aLines[prevX] });
    }
    k = prevK;
  }
  // leading context
  while (x > 0 && y > 0) {
    segments.push({ type: 'context', value: aLines[x - 1] });
    x--; y--;
  }
  // remaining deletions
  while (x > 0) { segments.push({ type: 'del', value: aLines[--x] }); }
  // remaining insertions
  while (y > 0) { segments.push({ type: 'add', value: bLines[--y] }); }
  segments.reverse();
  const hasChanges = segments.some(s => s.type !== 'context');
  return { segments, hasChanges };
}

export interface InlinePart { type: 'context' | 'add' | 'del'; text: string }
export interface InlineDiffLine { lineNumberA: number | null; lineNumberB: number | null; parts: InlinePart[] }

// Produce inline (char-level) diff only for changed lines pairs (heuristic: map sequential add/del pairs).
export function diffInline(lineSegs: DiffSegment[]): InlineDiffLine[] {
  const result: InlineDiffLine[] = [];
  let lineA = 0; let lineB = 0;
  for (let i = 0; i < lineSegs.length; i++) {
    const seg = lineSegs[i];
    if (seg.type === 'context') {
      lineA++; lineB++;
      result.push({ lineNumberA: lineA, lineNumberB: lineB, parts: [{ type: 'context', text: seg.value }] });
      continue;
    }
    // collect contiguous changes until next context
    const block: DiffSegment[] = [];
    while (i < lineSegs.length && lineSegs[i].type !== 'context') { block.push(lineSegs[i]); i++; }
    i--; // adjust for outer loop increment
    const dels = block.filter(b => b.type === 'del');
    const adds = block.filter(b => b.type === 'add');
    const maxPairs = Math.max(dels.length, adds.length);
    for (let p = 0; p < maxPairs; p++) {
      const aTxt = dels[p]?.value ?? '';
      const bTxt = adds[p]?.value ?? '';
      const parts: InlinePart[] = [];
      if (aTxt === bTxt) {
        parts.push({ type: 'context', text: aTxt });
      } else {
        // naive char diff (LCS dynamic programming) for small lines (< 400 chars) else fallback whole
        if (aTxt.length * bTxt.length <= 160000) {
          const lcs = buildLCSMatrix(aTxt, bTxt);
          backtrackLCS(aTxt, bTxt, lcs, parts);
        } else {
          if (aTxt) parts.push({ type: 'del', text: aTxt });
          if (bTxt) parts.push({ type: 'add', text: bTxt });
        }
      }
      result.push({ lineNumberA: aTxt ? ++lineA : null, lineNumberB: bTxt ? ++lineB : null, parts });
    }
  }
  return result;
}

function buildLCSMatrix(a: string, b: string): number[][] {
  const m = a.length; const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
}

function backtrackLCS(a: string, b: string, dp: number[][], parts: InlinePart[]) {
  let i = a.length; let j = b.length;
  const rev: InlinePart[] = [];
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) { rev.push({ type: 'context', text: a[i - 1] }); i--; j--; }
    else if (dp[i - 1][j] >= dp[i][j - 1]) { rev.push({ type: 'del', text: a[i - 1] }); i--; }
    else { rev.push({ type: 'add', text: b[j - 1] }); j--; }
  }
  while (i > 0) { rev.push({ type: 'del', text: a[--i] }); }
  while (j > 0) { rev.push({ type: 'add', text: b[--j] }); }
  rev.reverse();
  // merge adjoining same-type chars
  const merged: InlinePart[] = [];
  for (const part of rev) {
    const last = merged[merged.length - 1];
    if (last && last.type === part.type) last.text += part.text; else merged.push({ ...part });
  }
  parts.push(...merged);
}
