"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

// --- Types & Config (SRP: apenas declaração de contrato) ---
export interface MatrixRainProps {
  opacity?: number;           // Opacidade base aplicada por caractere
  fontSize?: number;          // Tamanho base da fonte em px
  density?: number;           // Fator de densidade (1 = padrão, >1 mais colunas)
  fadeAlpha?: number;         // Intensidade do fade trail (0..1 - menor = trail mais longo)
  color?: string;             // Cor principal (primeiro plano)
  accentColor?: string;       // Cor acentuada para alguns caracteres
  speedRange?: [number, number]; // Intervalo de velocidade (linhas por tick)
  glow?: boolean;             // Ativar brilho na "cabeça" da coluna
  variant?: 'default' | 'editor'; // Variante de estilo (editor = mais sutil)
  intensity?: 'low' | 'medium' | 'high'; // Ajuste rápido de densidade/opacidade
}

interface DropState {
  y: number;      // posição em linhas
  speed: number;  // linhas por frame
}

export const DEFAULT_MATRIX_CONFIG: Required<Omit<MatrixRainProps, 'speedRange' | 'variant' | 'intensity'>> & { speedRange: [number, number], variant: 'default', intensity: 'medium' } = {
  opacity: 0.6,
  fontSize: 14,
  density: 1,
  fadeAlpha: 0.08,
  color: '#10b981',      // emerald-500
  accentColor: '#34d399', // emerald-400
  speedRange: [0.75, 1.75],
  glow: true,
  variant: 'default',
  intensity: 'medium'
};

// Conjunto de caracteres (aberto para extensão sem modificar draw loop => OCP)
const CHAR_SET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*+-/';

// Hook utilitário para preferências de movimento reduzido (ISP: componente não precisa saber sobre window diretamente fora do efeito principal)
function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefers(mq.matches);
    const listener = (e: MediaQueryListEvent) => setPrefers(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);
  return prefers;
}

/**
 * MatrixRainBackground aprimorado: letras/números caindo com velocidades variadas, cores acentuadas ocasionais,
 * respeito à preferência de movimento reduzido e configurável via props.
 * Clean Code: funções pequenas, nomes explícitos. SOLID: SRP (desenhar efeito), OCP (config via props), DIP implícita (sem dependências fortes externas).
 */
export function computeMatrixConfig(input: MatrixRainProps): ReturnType<typeof Object.assign> {
  const merged: any = { ...DEFAULT_MATRIX_CONFIG, ...input }; // tipo interno simples para composição
  switch (merged.intensity) {
    case 'low':
      merged.opacity = Math.min(merged.opacity, 0.35);
      merged.density = Math.min(merged.density, 0.7);
      break;
    case 'high':
      merged.opacity = Math.max(merged.opacity, 0.75);
      merged.density = merged.density * 1.25;
      break;
  }
  if (merged.variant === 'editor') {
    merged.opacity = 0.5;
    merged.density = 0.9;
    merged.fadeAlpha = 0.07;
    merged.glow = false;
  }
  return merged;
}

export function MatrixRainBackground(props: MatrixRainProps) {
  const cfg = useMemo(() => computeMatrixConfig(props), [props]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const dropsRef = useRef<DropState[]>([]);
  const columnsRef = useRef<number>(0);
  const reducedMotion = usePrefersReducedMotion();

  const randomBetween = useCallback((min: number, max: number) => Math.random() * (max - min) + min, []);

  const setupCanvas = useCallback((canvasEl: HTMLCanvasElement) => {
    const dpr = window.devicePixelRatio || 1;
    canvasEl.width = window.innerWidth * dpr;
    canvasEl.height = window.innerHeight * dpr;
    canvasEl.style.width = window.innerWidth + 'px';
    canvasEl.style.height = window.innerHeight + 'px';
    const ctx = canvasEl.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    const columns = Math.floor((window.innerWidth / cfg.fontSize) * cfg.density);
    columnsRef.current = columns;
    dropsRef.current = Array.from({ length: columns }, () => ({
      y: Math.floor(Math.random() * -50),
      speed: randomBetween(cfg.speedRange[0], cfg.speedRange[1])
    }));
  }, [cfg.fontSize, cfg.density, cfg.speedRange, randomBetween]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setupCanvas(canvas);
    let lastTs = 0;
    let resizeRaf: number | null = null;
    function onResize() {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        if (!canvas) return;
        setupCanvas(canvas);
      });
    }
    window.addEventListener('resize', onResize, { passive: true });

    if (reducedMotion) {
      ctx.fillStyle = 'rgba(0,0,0,0.90)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = cfg.fontSize + 'px monospace';
      ctx.fillStyle = cfg.color;
      for (let i = 0; i < dropsRef.current.length; i++) {
        const ch = CHAR_SET.charAt(Math.floor(Math.random() * CHAR_SET.length));
        const x = i * cfg.fontSize;
        const y = Math.random() * canvas.height;
        ctx.globalAlpha = cfg.opacity;
        ctx.fillText(ch, x, y);
      }
      return () => window.removeEventListener('resize', onResize);
    }

    function draw(ts: number) {
      if (!canvas || !ctx) return;
      const delta = ts - lastTs;
      lastTs = ts;
      ctx.fillStyle = `rgba(0,0,0,${cfg.fadeAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${cfg.fontSize}px monospace`;
      for (let i = 0; i < dropsRef.current.length; i++) {
        const drop = dropsRef.current[i];
        const x = i * cfg.fontSize;
        const yPx = drop.y * cfg.fontSize;
        const isHead = Math.random() > 0.9;
        ctx.fillStyle = isHead ? cfg.accentColor : cfg.color;
        if (cfg.glow) {
          if (isHead) {
            ctx.shadowColor = typeof ctx.fillStyle === 'string' ? ctx.fillStyle : cfg.accentColor;
            ctx.shadowBlur = 8;
          } else {
            ctx.shadowBlur = 0;
          }
        }
        const ch = CHAR_SET.charAt(Math.floor(Math.random() * CHAR_SET.length));
        ctx.globalAlpha = cfg.opacity * (isHead ? 1 : 0.85);
        ctx.fillText(ch, x, yPx);
        drop.y += drop.speed * (delta / 16.666);
        if (yPx > canvas.height && Math.random() > 0.965) {
          drop.y = Math.floor(Math.random() * -20);
          drop.speed = randomBetween(cfg.speedRange[0], cfg.speedRange[1]);
        }
      }
      animationRef.current = requestAnimationFrame(draw);
    }
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', onResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- cfg é estável via useMemo e funções via useCallback
  }, [cfg, setupCanvas, reducedMotion, randomBetween]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* Overlay adaptativa conforme variante */}
      {cfg.variant === 'editor' ? null : (
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/10 via-transparent to-neutral-950" />
      )}
    </div>
  );
}
