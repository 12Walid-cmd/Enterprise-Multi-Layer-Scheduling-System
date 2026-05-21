import { http } from "../http";
import type {
  LeaveRequest,
  CreateLeaveDto,
  UpdateLeaveStatusDto,
  LeaveStatus,
} from "../../types/leave";

export const LeaveAPI = {
  create: async (data: CreateLeaveDto): Promise<LeaveRequest> => {
    const res = await http.post("/leave", data);
    return res.data;
  },

  myLeaves: async (status?: LeaveStatus): Promise<LeaveRequest[]> => {
    const res = await http.get("/leave/me", { params: { status } });
    return res.data;
  },

  cancelMyLeave: async (id: string): Promise<LeaveRequest> => {
    const res = await http.patch(`/leave/me/${id}/cancel`);
    return res.data;
  },

  pendingForApproval: async (): Promise<LeaveRequest[]> => {
    const res = await http.get("/leave/pending/for-approval");
    return res.data;
  },

  decide: async (id: string, dto: UpdateLeaveStatusDto): Promise<any> => {
    const res = await http.patch(`/leave/${id}/decision`, dto);
    return res.data;
  },
};