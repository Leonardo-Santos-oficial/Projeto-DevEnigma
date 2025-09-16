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
      provider: 'v8'
    }
  }
});
