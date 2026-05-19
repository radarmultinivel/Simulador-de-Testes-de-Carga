// Desenvolvido por L. A. Leandro
// São José dos Campos - SP
// 19/05/2026

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
