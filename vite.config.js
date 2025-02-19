import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './client',
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          charts: ['recharts'],
          pdf: ['pdfmake']
        }
      }
    }
  },
  define: {
    'process.env': {}
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  esbuild: {
    logOverride: {
      'this-is-undefined-in-esm': 'silent',
      'use-client-directive': 'silent'
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://travelplan.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});