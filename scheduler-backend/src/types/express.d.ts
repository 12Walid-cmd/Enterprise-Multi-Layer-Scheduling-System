import 'express';

declare module 'express' {
  export interface Request {
    user?: {
      id: string;
      email: string;

      first_name: string;
      last_name: string;
      timezone: string;
      working_mode: string;

      group_id?: string;

      team_ids: string[];
      sub_team_ids: string[];

      domain_ids: string[];
      domain_team_ids: string[];

      roles: string[];
      permissions: string[];

      scope: {                
        group_ids: string[];
        domain_ids: string[];
        team_ids: string[];
        rotation_ids: string[];
      };

    };
  }
}