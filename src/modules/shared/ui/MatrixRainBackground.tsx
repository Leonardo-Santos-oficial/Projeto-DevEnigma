"use client";
import React, { useEffect, useRef } from 'react';

/**
 * MatrixRainBackground
 * Canvas leve para efeito de "letras caindo" (estilo Matrix) atrás do conteúdo.
 * Responsável apenas por desenhar; não conhece domínio (SRP) e pode ser facilmente trocado (OCP).
 */
export function MatrixRainBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const columnsRef = useRef<number>(0);
  const dropsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const fontSize = 14;
      columnsRef.current = Math.floor(canvas.width / fontSize);
      dropsRef.current = Array(columnsRef.current).fill(0);
    }
    resize();
    window.addEventListener('resize', resize);

    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*+-/';
    const fontSize = 14;

    function draw() {
      if (!ctx) return;
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, 0, canvas!.width, canvas!.height);
      ctx.fillStyle = '#10b981'; // emerald-500
      ctx.font = fontSize + 'px monospace';
      for (let i = 0; i < dropsRef.current.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        const x = i * fontSize;
        const y = dropsRef.current[i] * fontSize;
        ctx.fillText(text, x, y);
  if (canvas && y > canvas.height && Math.random() > 0.975) {
          dropsRef.current[i] = 0;
        }
        dropsRef.current[i]++;
      }
      animationRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 opacity-40" aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/10 via-transparent to-neutral-950" />
    </div>
  );
}
