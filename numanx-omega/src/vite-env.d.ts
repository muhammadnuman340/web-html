/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PADDLE_TOKEN?: string
  readonly VITE_PADDLE_PRICE_ID?: string
  readonly VITE_PADDLE_ENV?: 'sandbox' | 'production'
  readonly VITE_PADDLE_SUCCESS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
