// Common timestamp type returned by the backend
export type Timestamp = string;

/* ============================================================
   1. GROUPS
   ============================================================ */

export interface Group {
  id: string;
  name: string;
  description: string;
  timezone: string;
  is_active: boolean;
  created_at: Timestamp;

  teams?: Team[];
}

export interface CreateGroupDto {
  name: string;
  description: string;
  timezone: string;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  timezone?: string;
}

/* ============================================================
   2. TEAMS (Root Team + SubTeam)
   ============================================================ */

export interface Team {
  id: string;
  group_id: string;
  parent_team_id: string | null; // null = root team
  name: string;
  description: string;
  timezone: string | null;
  is_active: boolean;
  created_at: Timestamp;

  team_members?: TeamMember[];
  sub_team_members?: SubTeamMember[];

}

/** Root team = parent_team_id === null */
export type RootTeam = Team & {
  parent_team_id: null;
};

/** Sub-team = parent_team_id !== null */
export type SubTeam = Team & {
  parent_team_id: string;
};

export interface CreateTeamDto {
  name: string;
  group_id: string;
  parent_team_id: string | null;
  description: string;
  timezone: string;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
  timezone?: string;
  parent_team_id?: string;
}

export interface CreateSubTeam {
  name: string;
  description?: string;
  timezone?: string;
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

  team_role_types?: {
    name: string;
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





