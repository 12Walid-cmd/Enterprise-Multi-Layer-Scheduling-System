// types/rotation.ts
export type RotationType =
  | "TEAM"
  | "SUBTEAM"
  | "ROLE"
  | "DOMAIN"
  | "DOMAIN_TEAM"
  | "CROSS_TEAM";

export type RotationCadence = "DAILY" | "WEEKLY" | "BIWEEKLY" | "CUSTOM";


export type RotationMemberType =
  | "USER"
  | "TEAM"
  | "SUBTEAM"
  | "ROLE"
  | "DOMAIN"
  | "DOMAIN_TEAM"
  | "GROUP";

export type RotationScope =
  | "TEAM"
  | "SUBTEAM"
  | "GROUP"
  | "ROLE"
  | "DOMAIN"
  | "DOMAIN_TEAM"
  | "NONE";

export interface RotationDefinition {
  id: string;
  name: string;
  code: string;
  type: RotationType;
  cadence: RotationCadence;
  cadence_interval: number;
  priority: number;
  allow_overlap: boolean;
  min_assignees: number;
  max_assignees: number;
  scope_type: RotationScope;
  scope_ref_id: string | null;
  owner_id: string | null;
  description: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  effective_date: string;
  freeze_date: string | null;

  rotation_members: RotationMember[];

}

export interface RotationMember {
  id: string;
  rotation_definition_id: string;
  member_type: RotationMemberType;
  member_ref_id: string;
  display_name: string;
  weight: number;
  is_active: boolean;
  order_index: number;
}


export interface AddMemberPayload {
  member_type: string;
  member_ref_id: string;
  weight: number;
  is_active: boolean;
}

export interface UpdateMemberPayload {
  weight?: number;
  is_active?: boolean;
}

// =============================
// Rotation Tiers
// =============================

export interface Tier {
  id: string;
  rotation_definition_id: string;
  tier_level: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface TierMember {
  id: string;
  tier_id: string;

  member_type: string;      // USER / TEAM / ROLE / ...
  member_ref_id: string;    // user_id / team_id / role_id

  weight: number;
  order_index: number;
  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export interface AddTier {
  tier_level: number;
  name: string;
}

export interface AddTierMember {
  member_type: string;
  member_ref_id: string;
  weight: number;
}

export interface UpdateTier {
  name?: string;
  tier_level?: number;
}

export interface UpdateTierMember {
  weight?: number;
  is_active?: boolean;
}

// =====================================
// Rotation Rules
// =============================

export interface RotationRule {
    id: string;
    rotation_id: string;
    rule_type: string;
    rule_payload: Record<string, any>;
    created_at: string;
}

export interface AddRotationRule {
    ruleType: string;
    rulePayload: Record<string, any>;
}

export interface UpdateRotationRule {
    rulePayload: Record<string, any>;
}