/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MAIN_VITE_APPIUM_HOME: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
