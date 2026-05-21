
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

    permissionMeta?: {
        code: string;
        name: string;
        description: string;
    }[];

    scope?: UserScope;
}


export interface UserScope {
    group_ids: string[];
    team_ids: string[];
    subteam_ids: string[];
    domain_ids: string[];
    rotation_ids: string[];

    leave_approval_team_ids: string[];
    leave_approval_group_ids: string[];

    holiday_group_ids: string[];
    holiday_global: boolean;
}
