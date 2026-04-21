import { http } from "../http";
import type {
  Domain,
  DomainDetail,
  CreateDomainDto,
  UpdateDomainDto,
} from "../../types/domain";

export const DomainAPI = {
  // =========================
  // LIST
  // =========================
  getAll(search?: string): Promise<Domain[]> {
    return http
      .get("/domains", {
        params: search ? { search } : {},
      })
      .then((res) => res.data);
  },

  // =========================
  // DETAIL
  // =========================
  getOne(id: string): Promise<DomainDetail> {
    return http.get(`/domains/${id}`).then((res) => res.data);
  },

  // =========================
  // CREATE
  // =========================
  create(data: CreateDomainDto): Promise<Domain> {
    return http.post("/domains", data).then((res) => res.data);
  },

  // =========================
  // UPDATE
  // =========================
  update(id: string, data: UpdateDomainDto): Promise<Domain> {
    return http.patch(`/domains/${id}`, data).then((res) => res.data);
  },

  // =========================
  // DELETE
  // =========================
  delete(id: string): Promise<void> {
    return http.delete(`/domains/${id}`).then((res) => res.data);
  },
};