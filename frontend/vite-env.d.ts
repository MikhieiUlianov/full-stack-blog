/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IK_URL_ENDPOINT: string;
  // тут можно добавить другие переменные окружения
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
