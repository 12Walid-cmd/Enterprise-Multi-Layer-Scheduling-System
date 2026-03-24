export interface DomainUser {
    id: string;
    domain_id: string;
    user_id: string;

    user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
}

export interface Domain {
    id: string;
    name: string;
    description?: string;
    exclusive: boolean;
    is_active: boolean;

    domain_teams: {
        id: string;
        teams: {
            id: string;
            name: string;
        };
        domainTeamMembers: {
            id: string;
            user: {
                id: string;
                name: string;
            };
        }[];
    }[];

    domain_users: DomainUser[];
}

export interface DomainTeam {
    id: string;
    domain_id: string;
    team_id: string;

    domains?: {
        id: string;
        name: string;
    };

    teams?: {
        id: string;
        name: string;
    };

    domainTeamMembers?: {
        id: string;
        user_id: string;
        user?: {
            id: string;
            name: string;
        };
    }[];
}

export interface DomainTeamMember {
  id: string;
  domain_team_id: string;
  user_id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}


export interface CreateDomainDto {
    name: string;
    description?: string;
    exclusive?: boolean;
    is_active?: boolean;
}

export interface UpdateDomainDto extends Partial<CreateDomainDto> {}

export interface AddTeamToDomainDto {
    domain_id: string;
    team_id: string;
}

export interface AddUserToDomainTeamDto {
    user_id: string;
}