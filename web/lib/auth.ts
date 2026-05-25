import { createBrowserSupabaseClient } from "./supabaseClient";

export async function getCurrentUser() {
  const supabase = createBrowserSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}