import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

function getServiceRoleKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
  );
}

function getAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function getSupabaseConfigError(): string | null {
  if (!supabaseUrl) {
    return "NEXT_PUBLIC_SUPABASE_URL が未設定です (.env.local を確認)";
  }
  if (!getServiceRoleKey()) {
    return "SUPABASE_SERVICE_ROLE_KEY または SUPABASE_SECRET_KEY が未設定です";
  }
  return null;
}

export function getSupabaseAdmin(): SupabaseClient {
  const configError = getSupabaseConfigError();
  if (configError) {
    throw new Error(configError);
  }

  return createClient(supabaseUrl!, getServiceRoleKey()!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getSupabaseAnon(): SupabaseClient {
  const anonKey = getAnonKey();
  if (!supabaseUrl || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY または NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY が未設定です"
    );
  }

  return createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
