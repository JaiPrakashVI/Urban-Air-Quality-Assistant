/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_ENABLE_GENAI_FALLBACK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
