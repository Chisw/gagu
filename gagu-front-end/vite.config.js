import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  server: {
    port: 9392,
  },
  resolve: {
    alias: {
      '@shared': path.resolve(
        __dirname,
        '../gagu-back-end/src/shared',
      ),
      '@': './src',
    }
  }
})
