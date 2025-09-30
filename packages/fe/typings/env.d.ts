/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL of the back-end API */
  readonly VITE_API_URL: string;
  readonly VITE_OIDC_ID: number;
  readonly VITE_HELP_GUIDE: string;
  readonly VITE_APPLICATION_NAME: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
