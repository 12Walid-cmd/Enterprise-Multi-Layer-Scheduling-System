export type LeaveStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "PARTIALLY_APPROVED";

export type LeaveType = "VACATION" | "SICK" | "PERSONAL" | "OTHER";

export interface LeaveRequest {
  id: string;
  user_id: string;
  type: LeaveType;
  start_date: string;
  end_date: string;
  is_full_day: boolean;
  reason: string;
  affects_schedule: boolean;
  status: LeaveStatus;
  created_at: string;
  users?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateLeaveDto {
  type: LeaveType;
  start_date: string;
  end_date: string;
  is_full_day?: boolean;
  reason?: string;
  affects_schedule?: boolean;
}

export interface UpdateLeaveStatusDto {
  decision: LeaveStatus;
  notes?: string;
}