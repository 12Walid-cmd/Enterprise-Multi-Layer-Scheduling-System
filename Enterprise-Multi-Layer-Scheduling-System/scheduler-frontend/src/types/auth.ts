export interface AuthTokens {
  access_token: string;
}

export interface AuthUser {
  id: string; 
  email: string;

  first_name?: string;
  last_name?: string;
  phone?: string;
  timezone?: string;

  working_mode?: "LOCAL" | "REMOTE" | "HYBRID";

  city?: string;
  province?: string;
  country?: string;

  is_active?: boolean;

  created_at?: string;
  updated_at?: string;

  roles: {
    code: string;
    name: string;
  }[]; 
  permissions: string[];

  scope: {
    group_ids: string[];
    team_ids: string[];
    sub_team_ids: string[]; 
    domain_ids: string[];
    rotation_ids: string[];
  };
  
}

