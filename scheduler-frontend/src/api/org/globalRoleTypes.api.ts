import { http } from "../http";
import type {
  GlobalRoleType,
  CreateGlobalRoleTypeDto,
  UpdateGlobalRoleTypeDto,
} from "../../types/org";

export const GlobalRoleTypesAPI = {
  getAll(search?: string): Promise<GlobalRoleType[]> {
    return http.get("/roles/global-types", {
      params: { search },
    })
      .then(res => res.data);
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
  
  checkCode(code: string, excludeId?: string): Promise<{ exists: boolean }> {
    return http.get("/roles/global-types/check-code", {
      params: { code, excludeId },
    }).then(res => res.data);
  },
};