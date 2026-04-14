
export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    timezone: string;
    is_active: boolean;

    team_members?: {
        teams?: { name: string };
        team_roles?: { name: string };
    }[];

    user_roles?: {
        global_roles?: { name: string };
    }[];

    permissions?: string[];

    scope?: {
        group_ids?: string[];
        domain_ids?: string[];
        team_ids?: string[];
        rotation_ids?: string[];
    };
}

export interface UserScope {
  group_ids: string[];
  domain_ids: string[];
  team_ids: string[];
  rotation_ids: string[];
}

