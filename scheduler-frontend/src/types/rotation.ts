export interface RotationDefinition {
  id: string;
  name: string;
  code: string;
  type: string;
  cadence: string;
  cadence_interval: number;
  allow_overlap: boolean;
  min_assignees: number;
  scope_type: string;
  scope_ref_id?: string | null;
  owner_id?: string | null; 
  is_active: boolean;
  created_at: string;
  updated_at: string;
  description?: string | null;
}

export interface RotationMember {
  id: string;
  rotation_definition_id: string;
  member_type: string;
  member_ref_id: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}