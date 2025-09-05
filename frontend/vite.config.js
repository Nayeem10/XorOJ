import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { 
<<<<<<< Updated upstream
        target: `http://172.28.130.16:8081`,
=======
        target: `http://localhost:8081`,
>>>>>>> Stashed changes
        changeOrigin: true 
      },
    },
  },  
})