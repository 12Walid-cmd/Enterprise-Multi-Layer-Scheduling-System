import { http } from "../http";
import type {
    Tier,
    TierMember,
    AddTier,
    AddTierMember,
    UpdateTier,
    UpdateTierMember,
} from "../../types/rotation";

export const TierAPI = {

    getTiers: async (rotationId: string): Promise<Tier[]> => {
        const res = await http.get(`/rotations/${rotationId}/tiers`);
        return res.data;
    },

    addTier: async (rotationId: string, data: AddTier): Promise<Tier> => {
        const res = await http.post(`/rotations/${rotationId}/tiers`, data);
        return res.data;
    },


    updateTier: async (tierId: string, data: UpdateTier): Promise<Tier> => {
        const res = await http.patch(`/rotations/tiers/${tierId}`, data);
        return res.data;
    },


    removeTier: async (tierId: string): Promise<void> => {
        await http.delete(`/rotations/tiers/${tierId}`);
    },


    getTierMembers: async (tierId: string): Promise<TierMember[]> => {
        const res = await http.get(`/rotations/tiers/${tierId}/members`);
        return res.data;
    },


    addTierMember: async (
        tierId: string,
        data: AddTierMember
    ): Promise<TierMember> => {
        const res = await http.post(`/rotations/tiers/${tierId}/members`, {
            ...data,
            is_active: true,
        });
        return res.data;
    },


    updateTierMember: async (
        memberId: string,
        data: UpdateTierMember
    ): Promise<TierMember> => {
        const res = await http.patch(`/rotations/tiers/members/${memberId}`, data);
        return res.data;
    },


    removeTierMember: async (tierId: string, memberId: string): Promise<void> => {
        await http.delete(`/rotations/tiers/${tierId}/members/${memberId}`);
    },
};