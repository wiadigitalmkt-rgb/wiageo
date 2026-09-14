import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Em dev local, encaminha /api para `vercel dev` (porta padrão 3000)
      // rode `vercel dev` em um terminal e `npm run dev` em outro.
      '/api': 'http://localhost:3000',
    },
  },
})
