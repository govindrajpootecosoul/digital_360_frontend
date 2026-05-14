/// <reference types="vite/client" />

/** Injected by Vite from `API_PROXY_TARGET` — dev: `/api`, prod: `${API_PROXY_TARGET}/api`. */
declare const __API_BASE__: string

interface ImportMetaEnv {
  readonly [key: string]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
