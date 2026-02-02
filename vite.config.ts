import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Выносим AG Grid в отдельный чанк, чтобы облегчить основной index.js
        manualChunks: {
          agGrid: ['ag-grid-community', 'ag-grid-enterprise', 'ag-grid-vue3'],
        },
      },
    },
  },
})
