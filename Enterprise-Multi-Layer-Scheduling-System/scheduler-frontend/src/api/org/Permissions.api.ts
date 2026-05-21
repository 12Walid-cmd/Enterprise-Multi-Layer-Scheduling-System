import { http } from "../http";
import type { PermissionType } from "../../types/permission";

export const PermissionsAPI = {
  /* ================= LIST  (search) ================= */
  getAll(search?: string): Promise<PermissionType[]> {
    return http
      .get("/admin/permissions", {
        params: { search },
      })
      .then(res => res.data);
  },

  /* ================= GET ONE ================= */
  getOne(code: string): Promise<PermissionType> {
    return http
      .get(`/admin/permissions/${code}`)
      .then(res => res.data);
  },

  /* ================= CREATE ================= */
  create(data: {
    code: string;
    name: string;
    description?: string;
  }): Promise<PermissionType> {
    return http
      .post("/admin/permissions", data)
      .then(res => res.data);
  },

  /* ================= UPDATE ================= */
  update(
    code: string,
    data: {
      name: string;
      description?: string;
    }
  ): Promise<PermissionType> {
    return http
      .patch(`/admin/permissions/${code}`, data)
      .then(res => res.data);
  },

  /* ================= DELETE ================= */
  delete(code: string): Promise<void> {
    return http
      .delete(`/admin/permissions/${encodeURIComponent(code)}`)
      .then(res => res.data);
  },

  /* ================= CHECK CODE ================= */
  checkCode(
    code: string,
    exclude?: string
  ): Promise<{ exists: boolean }> {
    return http
      .get(`/admin/permissions/check-code`, {
        params: {
          code,
          exclude,
        },
      })
      .then(res => res.data);
  },

  /* ================= REGISTRY (auto-scanned permissions) ================= */
  getRegistry(): Promise<string[]> {
    return http.get("/permissions/registry").then(res => res.data);
  },

  /* ================= SCOPE REGISTRY ================= */
  getScopeRegistry(): Promise<Record<string, string[]>> {
    return http.get("/permissions/scope-registry").then(res => res.data);
  }

};