export interface RotationDefinition {
  id: string;
  name: string;
  code: string;

  type: string;                 // RotationType enum
  cadence: string;              // RotationCadence enum
  cadence_interval: number;

  allow_overlap: boolean;
  min_assignees: number;

  scope_type: string;           // RotationScope enum
  scope_ref_id?: string | null;

  start_date: string;           // ISO string from backend
  end_date?: string | null;     // optional

  owner_id?: string | null;
  description?: string | null;

  is_active: boolean;

  created_at: string;
  updated_at: string;
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