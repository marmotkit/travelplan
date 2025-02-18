import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,tsx}",
      babel: {
        plugins: [
          ["@babel/plugin-transform-react-jsx"]
        ]
      }
    })
  ],
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
    'process.env': {},
    'React': 'react'
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'pdfmake/build/pdfmake',
      'pdfmake/build/vfs_fonts'
    ]
  },
  publicDir: 'public',
  esbuild: {
    jsxInject: `import React from 'react'`
  }
});