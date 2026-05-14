import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawApi = env.VITE_API_URL?.trim()
  const apiUrl = rawApi && rawApi.length > 0 ? rawApi : '/api'
  const proxyTarget = (env.API_PROXY_TARGET ?? '').trim()

  const useRelativeApi = apiUrl === '/api' || apiUrl.startsWith('/api/')
  const proxy =
    useRelativeApi && proxyTarget
      ? {
          '/api': {
            target: proxyTarget.replace(/\/$/, ''),
            changeOrigin: true,
          },
        }
      : undefined

  // Proxy is dev-server only; do not fail `vite build` on Vercel/CI where .env is absent.
  if (command === 'serve' && useRelativeApi && !proxyTarget) {
    throw new Error(
      'When VITE_API_URL is /api, set API_PROXY_TARGET in .env to your backend origin (e.g. http://localhost:4100). See .env.example.',
    )
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // Same-origin `/api` in dev avoids CORS when the API runs on another port; target comes from .env only.
      ...(proxy ? { proxy } : {}),
    },
  }
})
