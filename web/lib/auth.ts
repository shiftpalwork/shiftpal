import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

export type UserRole = "admin" | "supervisor" | "worker";

export type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  company_id: string;
};

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createBrowserSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, company_id")
    .eq("email", user.email)
    .single();

  if (error || !data) {
    return null;
  }

  return data as UserProfile;
}