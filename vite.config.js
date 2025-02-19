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
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('發送請求到:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('收到響應:', proxyRes.statusCode);
          });
        }
      }
    }
  }
});