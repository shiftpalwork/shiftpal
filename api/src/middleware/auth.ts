import { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabase";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email?: string; role?: string; company_id?: string };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "Missing bearer token" });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: "Invalid token" });

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id,email,role,company_id")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) return res.status(403).json({ error: "Profile not found" });
  req.user = profile;
  next();
}

export function requireSupervisor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!["supervisor", "admin"].includes(req.user?.role ?? "")) {
    return res.status(403).json({ error: "Supervisor access required" });
  }
  next();
}
