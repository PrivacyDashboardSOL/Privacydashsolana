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
      // Fix for @solana/web3.js dependency resolution in Vite/Rollup
      // Many versions of web3.js try to import the .js file directly, which fails 
      // when the rpc-websockets package.json only exports the path without the extension.
      'rpc-websockets/dist/lib/client.js': 'rpc-websockets/dist/lib/client',
      'rpc-websockets': 'rpc-websockets/dist/lib/client',
    },
  },
  optimizeDeps: {
    include: ['rpc-websockets'],
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