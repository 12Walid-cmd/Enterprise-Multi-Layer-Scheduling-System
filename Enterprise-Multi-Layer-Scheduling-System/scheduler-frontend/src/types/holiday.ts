export interface Holiday {
  id: string;
  name: string;
  date: string; // ISO string
  is_active: boolean;

  group_id?: string | null;
  team_id?: string | null;
  domain_id?: string | null;
  domain_team_id?: string | null;
  global_role_id?: string | null;
  team_role_id?: string | null;
}

export interface CreateHolidayInput {
  name: string;
  date: string;

  group_id?: string;
  team_id?: string;
  domain_id?: string;
  domain_team_id?: string;
  global_role_id?: string;
  team_role_id?: string;
}

export interface UpdateHolidayInput {
  name?: string;
  date?: string;
  is_active?: boolean;
}