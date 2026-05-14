/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API base including `/api`, e.g. `/api` or `http://localhost:4100/api` */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
