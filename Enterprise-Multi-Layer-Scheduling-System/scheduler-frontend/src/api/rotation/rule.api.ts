// src/api/RuleAPI.ts
import { http } from "../http";
import type {
    RotationRule,
    AddRotationRule,
    UpdateRotationRule,
} from "../../types/rotation";

export const RuleAPI = {
    getRules: async (rotationId: string): Promise<RotationRule[]> => {
        const res = await http.get(`/rotations/${rotationId}/rules`);
        return res.data;
    },

    addRule: async (
        rotationId: string,
        data: AddRotationRule
    ): Promise<RotationRule> => {
        const res = await http.post(`/rotations/${rotationId}/rules`, data);
        return res.data;
    },

    updateRule: async (
        rotationId: string,
        ruleId: string,
        data: UpdateRotationRule
    ): Promise<RotationRule> => {
        const res = await http.patch(`/rotations/${rotationId}/rules/${ruleId}`, data);
        return res.data;
    },

    removeRule: async (rotationId: string, ruleId: string): Promise<void> => {
        await http.delete(`/rotations/${rotationId}/rules/${ruleId}`);
    },
};