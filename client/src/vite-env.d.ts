/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_COMPANY_NAME?: string
  readonly VITE_COMPANY_EMAIL?: string
  readonly VITE_COMPANY_PHONE?: string
  readonly VITE_WHATSAPP_NUMBER?: string
  readonly VITE_WHATSAPP_MSG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
