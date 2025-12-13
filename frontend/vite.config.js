import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        allowedHosts: [
            "devserver-main--tourmaline-sprite-523e11.netlify.app"
        ],
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api/, '/api'); },
            },
        },
    },
});
