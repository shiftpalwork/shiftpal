export type UserRole = "worker" | "supervisor" | "admin";
export type ShiftStatus = "scheduled" | "completed" | "missed" | "cancelled";
export type SwapStatus = "pending_peer" | "pending_supervisor" | "approved" | "declined";
export type AttendanceStatus = "present" | "late" | "absent" | "excused";

export interface Profile {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  mobile?: string;
  role: UserRole;
  reliability_score: number;
  created_at: string;
}

export interface Shift {
  id: string;
  company_id: string;
  worker_id: string;
  role_name: string;
  location: string;
  starts_at: string;
  ends_at: string;
  status: ShiftStatus;
}

export interface SwapRequest {
  id: string;
  company_id: string;
  requester_shift_id: string;
  requester_id: string;
  target_worker_id: string;
  reason?: string;
  status: SwapStatus;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  company_id: string;
  shift_id: string;
  worker_id: string;
  status: AttendanceStatus;
  clock_in_at?: string;
  clock_out_at?: string;
}
