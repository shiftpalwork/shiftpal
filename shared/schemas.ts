import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const createShiftSchema = z.object({
  worker_id: uuidSchema,
  role_name: z.string().min(2).max(80),
  location: z.string().min(2).max(120),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime()
}).refine((v) => new Date(v.ends_at) > new Date(v.starts_at), {
  message: "ends_at must be after starts_at",
  path: ["ends_at"]
});

export const createSwapSchema = z.object({
  requester_shift_id: uuidSchema,
  target_worker_id: uuidSchema,
  reason: z.string().max(300).optional()
});

export const peerSwapDecisionSchema = z.object({
  accepted: z.boolean(),
  reason: z.string().max(300).optional()
});

export const supervisorSwapDecisionSchema = z.object({
  approved: z.boolean(),
  reason: z.string().max(300).optional()
});

export const payrollExportSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime()
}).refine((v) => new Date(v.to) > new Date(v.from), {
  message: "to must be after from",
  path: ["to"]
});
