import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode, isPreview }) => {
  const env = loadEnv(mode, process.cwd(), '')
  /** Prefer process.env so CI/Vercel dashboard vars apply even if .env files are missing. */
  const proxyTarget = (
    process.env.API_PROXY_TARGET ??
    process.env.VITE_API_PROXY_TARGET ??
    env.API_PROXY_TARGET ??
    ''
  )
    .trim()
    .replace(/\/$/, '')

  const isDevServer = command === 'serve' && !isPreview

  if (isDevServer && !proxyTarget) {
    throw new Error(
      'Set API_PROXY_TARGET in .env to your backend origin (e.g. http://localhost:4100 or https://api.example.com/path). See .env.example.',
    )
  }

  if (command === 'build' && !proxyTarget) {
    throw new Error(
      'Set API_PROXY_TARGET for production builds (e.g. in Vercel Environment Variables). See .env.example.',
    )
  }

  /** Dev: same-origin `/api` via proxy. Production: full `${API_PROXY_TARGET}/api`. */
  const apiBase = command === 'build' ? `${proxyTarget}/api` : '/api'

  return {
    define: {
      __API_BASE__: JSON.stringify(apiBase),
    },
    plugins: [react(), tailwindcss()],
    server: {
      ...(isDevServer && proxyTarget
        ? {
            proxy: {
              '/api': {
                target: proxyTarget,
                changeOrigin: true,
              },
            },
          }
        : {}),
    },
  }
})
