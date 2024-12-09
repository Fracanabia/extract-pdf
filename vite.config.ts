import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separa o pdf.worker em um chunk separado
          if (id.includes('pdfjs-dist/build/pdf.worker')) {
            return 'pdf.worker';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      // Alias direto, se necessário
      '@pdfjs': 'node_modules/pdfjs-dist',
    },
  },
})
