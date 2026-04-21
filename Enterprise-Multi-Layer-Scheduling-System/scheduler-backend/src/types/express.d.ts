import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    user: {
      id: string;
      email: string;

      first_name: string;
      last_name: string;
      timezone: string;
      working_mode: string;

      group_id?: string;

      team_ids: string[];
      subteam_ids: string[];

      domain_ids: string[];
      rotation_ids: string[];

      roles: string[];
      permissions: string[];

      scope: {
        group_ids: string[];
        domain_ids: string[];
        team_ids: string[];
        subteam_ids: string[];
        rotation_ids: string[];

        leave_approval_team_ids: string[];
        leave_approval_group_ids: string[];

        holiday_group_ids: string[];
        holiday_global: boolean;
      };
    };
  }
}
