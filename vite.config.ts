
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'global': 'window',
    'process.browser': true,
  },
  resolve: {
    alias: {
      // Direct fix for the common Solana web3.js + Vite build error.
      // We map the problematic deep import string used internally by dependencies
      // to the top-level package, which Vite can resolve using the browser entry point.
      'rpc-websockets/dist/lib/client': 'rpc-websockets',
    },
  },
  optimizeDeps: {
    include: ['rpc-websockets', '@solana/web3.js'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          solana: ['@solana/web3.js', '@solana/wallet-adapter-react', '@solana/wallet-adapter-react-ui'],
        },
      },
    },
  },
});
