interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_KEY: string;
  readonly SECRET_OPENROUTER_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
