import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
      '@': '/src'
    }
  }
})
