import { Router } from "express";
import { Parser } from "json2csv";
import { payrollExportSchema } from "../../../shared/schemas";
import { supabaseAdmin } from "../lib/supabase";
import { AuthenticatedRequest, requireAuth, requireSupervisor } from "../middleware/auth";

export const payrollRouter = Router();

export function calculateHours(start: string, end: string): number {
  return Math.round(((new Date(end).getTime() - new Date(start).getTime()) / 36_000) ) / 100;
}

payrollRouter.get("/export", requireAuth, requireSupervisor, async (req: AuthenticatedRequest, res) => {
  const parsed = payrollExportSchema.safeParse({ from: req.query.from, to: req.query.to });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data, error } = await supabaseAdmin
    .from("attendance_records")
    .select("status, clock_in_at, clock_out_at, profiles(full_name,email), shifts(role_name,location,starts_at,ends_at)")
    .eq("company_id", req.user!.company_id)
    .gte("created_at", parsed.data.from)
    .lte("created_at", parsed.data.to);

  if (error) return res.status(500).json({ error: error.message });

  const rows = (data ?? []).map((r: any) => ({
    worker_name: r.profiles?.full_name,
    worker_email: r.profiles?.email,
    role_name: r.shifts?.role_name,
    location: r.shifts?.location,
    status: r.status,
    scheduled_start: r.shifts?.starts_at,
    scheduled_end: r.shifts?.ends_at,
    clock_in_at: r.clock_in_at,
    clock_out_at: r.clock_out_at,
    payable_hours: r.clock_in_at && r.clock_out_at ? calculateHours(r.clock_in_at, r.clock_out_at) : 0
  }));

  const csv = new Parser().parse(rows);
  res.header("Content-Type", "text/csv");
  res.attachment("shiftpal-payroll-export.csv");
  return res.send(csv);
});
