import { http } from "../http";
import type{
  RoleType,
  CreateRoleTypeDto,
  UpdateRoleTypeDto,
} from "../../types/org";

export const RoleTypesAPI = {
  getAll(): Promise<RoleType[]> {
    return http.get("/roles/types").then(res => res.data);
  },

  create(data: CreateRoleTypeDto): Promise<RoleType> {
    return http.post("/roles/types", data).then(res => res.data);
  },

  update(id: string, data: UpdateRoleTypeDto): Promise<RoleType> {
    return http.patch(`/roles/types/${id}`, data).then(res => res.data);
  },

  delete(id: string): Promise<void> {
    return http.delete(`/roles/types/${id}`).then(res => res.data);
  },
};