export interface AuthTokens {
  access_token: string;
}

export interface AuthUser {
  userId: string;
  email: string;

  first_name?: string;
  last_name?: string;
  phone?: string;
  timezone?: string;

  working_mode?: "LOCAL" | "REMOTE" | "HYBRID"; // enum

  city?: string;
  province?: string;
  country?: string;

  is_active?: boolean;

  created_at?: string;
  updated_at?: string;

  roles: string[];         
  permissions: string[];

  scope: {
    group_ids: string[];
    domain_ids: string[];
    team_ids: string[];
    rotation_ids: string[];
  };

}