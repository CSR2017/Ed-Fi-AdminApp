/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_RUNNING_LOCALLY: boolean;
  // more env variables...
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
