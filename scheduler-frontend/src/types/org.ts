// Common timestamp type returned by the backend
export type Timestamp = string;

/* ============================================================
   1. GROUPS
   ============================================================ */

export type Group = {
  id: string;
  name: string;
  description?: string;
  timezone?: string;
  is_active?: boolean;
  created_at?: string;

  owner?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };

  _count?: {
    teams: number;
  };
};

export interface CreateGroupDto {
  name: string;
  description?: string;
  timezone?: string;
  is_active?: boolean;
  owner_user_id?: string | null;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  timezone?: string;
  is_active?: boolean;
  owner_user_id?: string | null;
}

/* ============================================================
   2. TEAMS (Root Team + SubTeam - SAME TABLE)
   ============================================================ */

/* ================= BASE TEAM ================= */

export interface Team {
  id: string;
  group_id: string;
  parent_team_id: string | null; // null = root team

  name: string;
  description?: string;
  timezone?: string;

  is_active: boolean;
  created_at: Timestamp;

  // relations
  groups?: {
    id: string;
    name: string;
  };

  lead?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
  };

  // counts
  _count?: {
    team_members: number;
    other_teams?: number;
  };

  // 
  total_members?: number;
}

/* ================= ROOT TEAM ================= */

export type RootTeam = Team & {
  parent_team_id: null;
};

/* ================= SUB TEAM ================= */

export interface SubTeam {
  id: string;
  name: string;
  description?: string;
  timezone?: string;
  parent_team_id: string;

  lead?: {
    id: string;
    first_name: string;
    last_name: string;
  };

  _count?: {
    sub_team_members: number;
  };
}

/* ============================================================
   DTOs
   ============================================================ */

/* ================= TEAM ================= */

export interface CreateTeamDto {
  name: string;
  group_id: string;

  // root team 
  parent_team_id?: string | null;

  description?: string;
  timezone?: string;

  lead_user_id?: string;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
  timezone?: string;

  parent_team_id?: string | null;

  lead_user_id?: string;
}

/* ================= SUB TEAM ================= */

export interface CreateSubTeam {
  name: string;
  description?: string;
  timezone?: string;

  lead_user_id?: string;
}

export interface UpdateSubTeamDto {
  name?: string;
  description?: string;
  timezone?: string;

  lead_user_id?: string;
}

/* ============================================================
   3. TEAM MEMBERS
   ============================================================ */

export interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  team_role_id: string;
  is_active: boolean;
  created_at: Timestamp;

  users?: {
    first_name: string;
    last_name: string;
    email: string;
  };

  team_roles?: {
    name: string;
    id?: string;
  };
}

export interface AddTeamMemberDto {
  userId: string;
  teamRoleId: string;
}
/* ============================================================
   3B. SUB-TEAM MEMBERS
   ============================================================ */

export interface SubTeamMember {
  id: string;
  sub_team_id: string;
  user_id: string;
  created_at: Timestamp;

  users?: {
    first_name: string;
    last_name: string;
    email: string;
  };

  team_roles?: {
    name: string;
  };
}

export interface AddSubTeamMemberDto {
  userId: string;
}
/* ============================================================
   4. TEAM ROLE TYPES
   ============================================================ */

export interface TeamRoleType {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  created_at: Timestamp;
}

export interface CreateTeamRoleTypeDto {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateTeamRoleTypeDto {
  code?: string;
  name?: string;
  description?: string;
}

/* ============================================================
   5. GLOBAL ROLE TYPES
   ============================================================ */

export interface GlobalRoleType {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  created_at: Timestamp;
}

export interface CreateGlobalRoleTypeDto {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateGlobalRoleTypeDto {
  code?: string;
  name?: string;
  description?: string;
}

/* ============================================================
   6. USER GLOBAL ROLES
   ============================================================ */

export interface UserGlobalRole {
  id: string;
  user_id: string;
  global_role_id: string;
  created_at: Timestamp;

  global_roles?: GlobalRoleType;
}

export interface AssignUserGlobalRoleDto {
  userId: string;
  globalRoleId: string;
}



export interface UserScope {
  group_ids: string[];
  domain_ids: string[];
  team_ids: string[];
  rotation_ids: string[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[]; 
}
