// Common timestamp type returned by the backend
export type Timestamp = string;

/* ============================================================
   1. GROUPS
   ============================================================ */

/**
 * Represents an organizational group.
 * Returned by:
 *  - POST /groups
 *  - GET /groups
 *  - PATCH /groups/:id
 *  - DELETE /groups/:id
 */
export interface Group {
  id: string;
  name: string;
  description: string;
  timezone: string;
  is_active: boolean;
  created_at: Timestamp;

  /**
   * Only returned by GET /groups
   * Contains all teams under this group.
   */
  teams?: Team[];
}

/**
 * Request body for creating a new group.
 */
export interface CreateGroupDto {
  name: string;
  description: string;
  timezone: string;
}

/**
 * Request body for updating a group.
 */
export interface UpdateGroupDto {
  name?: string;
  description?: string;
  timezone?: string;
}


/* ============================================================
   2. TEAMS
   ============================================================ */

/**
 * Represents a team within a group.
 * Returned by:
 *  - POST /teams
 *  - GET /teams
 *  - PATCH /teams/:id
 *  - DELETE /teams/:id
 */
export interface Team {
  id: string;
  group_id: string;
  parent_team_id: string | null;
  name: string;
  description: string;
  timezone: string | null;
  is_active: boolean;
  created_at: Timestamp;

  /**
   * Only returned by GET /teams
   * Members assigned to this team.
   */
  team_members?: TeamMember[];

  /**
   * Only returned by GET /teams
   * Other related teams (future expansion).
   */
  other_teams?: Team[];
}

/**
 * Request body for creating a new team.
 */
export interface CreateTeamDto {
  name: string;
  group_id: string;
  parent_team_id: string | null;
  description: string;
  timezone: string;
}

/**
 * Request body for updating a team.
 */
export interface UpdateTeamDto {
  name?: string;
  description?: string;
  timezone?: string;
}


/* ============================================================
   3. TEAM MEMBERS
   ============================================================ */

/**
 * Represents a member assigned to a team.
 * Returned by:
 *  - POST /teams/:teamId/members
 *  - DELETE /teams/:teamId/members/:userId
 */
export interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role_type_id: string;
  is_active: boolean;
  created_at: Timestamp;
}

/**
 * Request body for adding a member to a team.
 */
export interface AddTeamMemberDto {
  user_id: string;
  role_type_id: string;
}


/* ============================================================
   4. ROLE TYPES
   ============================================================ */

/**
 * Represents a role type (e.g., Engineer, Analyst, Manager).
 * Returned by:
 *  - POST /roles/types
 *  - GET /roles/types
 *  - PATCH /roles/types/:id
 *  - DELETE /roles/types/:id
 */
export interface RoleType {
  id: string;
  code: string;
  name: string;
  description: string;
  created_at: Timestamp;
}

/**
 * Request body for creating a role type.
 */
export interface CreateRoleTypeDto {
  code: string;
  name: string;
  description: string;
}

/**
 * Request body for updating a role type.
 */
export interface UpdateRoleTypeDto {
  name?: string;
  description?: string;
}


/* ============================================================
   5. USER ROLES
   ============================================================ */

/**
 * Represents a role assigned to a user.
 * Returned by:
 *  - POST /roles/users
 *  - DELETE /roles/users/:userId/:roleTypeId
 *  - GET /roles/users/:userId
 */
export interface UserRole {
  id: string;
  user_id: string;
  role_type_id: string;
  created_at: Timestamp;

  /**
   * Only returned by GET /roles/users/:userId
   * Contains full role type details.
   */
  role_types?: RoleType;
}

/**
 * Request body for assigning a role to a user.
 */
export interface AssignRoleToUserDto {
  user_id: string;
  role_type_id: string;
}