/* eslint-disable import/order */
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'src/core'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@lib': path.resolve(__dirname, 'src/lib')
    }
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      reporter: ['text', 'html'],
      provider: 'v8',
      // We scope coverage to core business logic (domain + infrastructure) and logging utilities.
      // Framework integration (Next.js app router pages, React UI components, config, env, DI setup, seeds)
      // is excluded so thresholds reflect meaningful test depth instead of penalizing untestable glue code.
      include: [
        'src/modules/**/domain/**/*.ts',
        'src/modules/**/infrastructure/**/*.ts',
        'src/core/logging/**/*.ts'
      ],
      exclude: [
        'src/modules/**/*.spec.ts',
        'src/modules/**/ui/**/*',
        'src/app/**/*',
        'src/core/bootstrap/**/*',
        'src/core/config/**/*',
        'src/core/di/**/*',
        'src/core/auth/**/*',
        'prisma/**/*',
        '**/*.d.ts'
      ],
      thresholds: {
        lines: 70,
        statements: 70,
        functions: 60,
        branches: 55
      }
    }
  }
});
