import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002, // Initially 3002, later dynamically assigned (e.g., 3004, 3005)
    proxy: {
      '/api/tts': { // Added specific proxy for TTS
        target: 'http://localhost:5002/genai-385616/us-central1/tts',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tts/, '')
      },
      '/api/stt': { // Added specific proxy for STT
        target: 'http://localhost:5002/genai-385616/us-central1/stt',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stt/, '')
      },
      '/api/generate': { // Added specific proxy for generate
        target: 'http://localhost:5002/genai-385616/us-central1/generate',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/generate/, '')
      },
      '/api': { // General proxy, kept for other potential API calls
        target: 'http://localhost:5002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});