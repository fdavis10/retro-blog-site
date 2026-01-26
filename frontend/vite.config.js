import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://backend:8000',
        changeOrigin: true,
      }
    }
  }
})


user = User.objects.create_user(
    username='admin_test',
    email='admin_test@example.com',
    password='admin123',
    is_approved=True,
    is_admin_user=True,
    is_staff=True,
    is_superuser=True
)