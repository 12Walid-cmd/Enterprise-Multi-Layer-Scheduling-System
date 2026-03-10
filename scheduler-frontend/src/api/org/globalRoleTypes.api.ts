import { http } from "../http";
import type {
  GlobalRoleType,
  CreateGlobalRoleTypeDto,
  UpdateGlobalRoleTypeDto,
} from "../../types/org";

export const GlobalRoleTypesAPI = {
  getAll(): Promise<GlobalRoleType[]> {
    return http.get("/roles/global-types").then(res => res.data);
  },

  getOne(id: string): Promise<GlobalRoleType> {
    return http.get(`/roles/global-types/${id}`).then(res => res.data);
  },

  create(data: CreateGlobalRoleTypeDto): Promise<GlobalRoleType> {
    return http.post("/roles/global-types", data).then(res => res.data);
  },

  update(id: string, data: UpdateGlobalRoleTypeDto): Promise<GlobalRoleType> {
    return http.patch(`/roles/global-types/${id}`, data).then(res => res.data);
  },

  delete(id: string): Promise<void> {
    return http.delete(`/roles/global-types/${id}`).then(res => res.data);
  },
};