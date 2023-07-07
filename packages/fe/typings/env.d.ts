/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL of the back-end API */
  readonly VITE_API_URL: string;
  /** Is the back-end running outside AWS, where it can't retrieve IAM credentials automatically */
  readonly VITE_RUNNING_LOCALLY: boolean;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
