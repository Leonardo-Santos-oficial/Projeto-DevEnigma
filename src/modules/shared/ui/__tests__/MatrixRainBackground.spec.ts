import { describe, it, expect } from 'vitest';
import { computeMatrixConfig, DEFAULT_MATRIX_CONFIG } from '../MatrixRainBackground';

describe('computeMatrixConfig', () => {
  it('usa defaults quando nada é passado', () => {
    const cfg = computeMatrixConfig({});
    expect(cfg.opacity).toBe(DEFAULT_MATRIX_CONFIG.opacity);
    expect(cfg.density).toBe(DEFAULT_MATRIX_CONFIG.density);
  });

  it('aplica intensidade low reduzindo opacity e density', () => {
    const cfg = computeMatrixConfig({ intensity: 'low' });
    expect(cfg.opacity).toBeLessThanOrEqual(0.35);
    expect(cfg.density).toBeLessThanOrEqual(0.7);
  });

  it('aplica intensidade high aumentando opacity e density', () => {
    const base = computeMatrixConfig({});
    const high = computeMatrixConfig({ intensity: 'high' });
    expect(high.opacity).toBeGreaterThanOrEqual(base.opacity);
    expect(high.density).toBeGreaterThan(base.density);
  });

  it('variante editor força parâmetros específicos', () => {
    const cfg = computeMatrixConfig({ variant: 'editor' });
    expect(cfg.opacity).toBe(0.5);
    expect(cfg.density).toBe(0.9);
    expect(cfg.glow).toBe(false);
  });
});
