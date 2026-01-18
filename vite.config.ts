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
      // Fix for @solana/web3.js dependency resolution
      // The .js extension is required to bypass the package exports map
      'rpc-websockets': 'rpc-websockets/dist/lib/client.js',
    },
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