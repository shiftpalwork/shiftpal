import { Router } from "express";
import { createSwapSchema, peerSwapDecisionSchema, supervisorSwapDecisionSchema } from "../../lib/schemas";
import { supabaseAdmin } from "../lib/supabase";
import { AuthenticatedRequest, requireAuth, requireSupervisor } from "../middleware/auth";

export const swapsRouter = Router();

swapsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabaseAdmin
    .from("swap_requests")
    .select("*, requester_shift:shifts(*)")
    .eq("company_id", req.user!.company_id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ swaps: data });
});

swapsRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = createSwapSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data: shift, error: shiftError } = await supabaseAdmin
    .from("shifts")
    .select("id,company_id,worker_id")
    .eq("id", parsed.data.requester_shift_id)
    .single();

  if (shiftError || !shift) return res.status(404).json({ error: "Shift not found" });
  if (shift.worker_id !== req.user!.id) return res.status(403).json({ error: "You can only swap your own shift" });

  const { data, error } = await supabaseAdmin
    .from("swap_requests")
    .insert({
      ...parsed.data,
      requester_id: req.user!.id,
      company_id: req.user!.company_id,
      status: "pending_peer"
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ swap: data });
});

swapsRouter.patch("/:id/peer", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = peerSwapDecisionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const status = parsed.data.accepted ? "pending_supervisor" : "declined";
  const { data, error } = await supabaseAdmin
    .from("swap_requests")
    .update({ status, peer_reason: parsed.data.reason ?? null })
    .eq("id", req.params.id)
    .eq("target_worker_id", req.user!.id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ swap: data });
});

swapsRouter.patch("/:id/supervisor", requireAuth, requireSupervisor, async (req: AuthenticatedRequest, res) => {
  const parsed = supervisorSwapDecisionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const status = parsed.data.approved ? "approved" : "declined";
  const { data, error } = await supabaseAdmin
    .from("swap_requests")
    .update({ status, supervisor_reason: parsed.data.reason ?? null })
    .eq("id", req.params.id)
    .eq("company_id", req.user!.company_id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ swap: data });
});
