/**
 * Typed environment configuration helper (Phase 1 — reads placeholders only).
 * Never commit real secrets. See `.env.example`.
 */

export interface AppEnv {
  openaiApiKey: string | undefined;
  supabaseUrl: string | undefined;
  supabaseServiceRoleKey: string | undefined;
  databaseUrl: string | undefined;
}

export function getAppEnv(): AppEnv {
  return {
    openaiApiKey: process.env.OPENAI_API_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    databaseUrl: process.env.DATABASE_URL,
  };
}
