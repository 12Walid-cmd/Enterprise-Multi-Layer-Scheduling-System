import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

import { OrgService } from './org.service';


// Groups
import { GroupsController } from './groups/groups.controller';
import { GroupsService } from './groups/groups.service';

// Teams
import { TeamsController } from './teams/teams.controller';
import { TeamsService } from './teams/teams.service';

// Members
import { MembersController } from './members/members.controller';
import { MembersService } from './members/members.service';
// Team Role Types
import { TeamRoleTypesController } from './roles/team-role-types.controller';
import { TeamRoleTypesService } from './roles/team-role-types.service';

// Global Role Types
import { GlobalRoleTypesController } from './roles/global-role-types.controller';
import { GlobalRoleTypesService } from './roles/global-role-types.service';

// User Roles 
import { UserRolesController } from './roles/user-roles.controller';
import { UserRolesService } from './roles/user-roles.service';

// Sub-teams
import { SubTeamController } from './teams/sub-team.controller';
import { SubTeamService } from './teams/sub-team.service';

// Sub-team Members
import { SubTeamMembersController } from './members/sub-team-members.controller';
import { SubTeamMembersService } from './members/sub-team-members.service';



import { DomainsService } from './domains/domains.service';
import { DomainTeamsService } from './domains/domain-teams.service';
import { DomainsController } from './domains/domains.controller';
import { DomainTeamsController } from './domains/domain-teams.controller';
import { DomainUsersController } from './domains/domain-users.controller';
import { DomainUsersService } from './domains/domain-users.service';


import { AuditModule } from 'src/audit/audit.module';

// Roles
import { RolesService } from './roles/roles.service';
import { RolesController } from './roles/roles.controller';

// Permissions
import { GlobalRolePermissionsController } from './roles/global-role-permissions.controller';
import { GlobalRolePermissionsService } from './roles/global-role-permissions.service';


@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [
    GroupsController,
    TeamsController,
    MembersController,
    RolesController,
    TeamRoleTypesController,
    GlobalRoleTypesController,
    UserRolesController,
    SubTeamController,
    SubTeamMembersController,
    DomainsController,
    DomainUsersController,
    DomainTeamsController,
    GlobalRolePermissionsController,
  ],
  providers: [
    PrismaService,
    OrgService,
    GroupsService,
    TeamsService,
    MembersService,
    RolesService,
    TeamRoleTypesService,
    GlobalRoleTypesService,
    UserRolesService,
    SubTeamService,
    SubTeamMembersService,
    DomainsService,
    DomainUsersService,
    DomainTeamsService,
    GlobalRolePermissionsService,
  ],
  exports: [OrgService],
})
export class OrgModule { }