/// <reference types="vite/client" />
/// <reference types="chrome" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Chrome Extension Types
declare global {
  interface Window {
    chrome: typeof chrome
  }
}

export {}