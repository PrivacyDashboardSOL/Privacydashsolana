import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'global': 'window',
  },
  resolve: {
    alias: {
      // Direct alias to the browser-compatible client file to fix the rpc-websockets resolve error
      'rpc-websockets': 'rpc-websockets/dist/lib/client',
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
      // Ensure rpc-websockets is handled correctly by the CommonJS plugin
      include: [/rpc-websockets/, /node_modules/],
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