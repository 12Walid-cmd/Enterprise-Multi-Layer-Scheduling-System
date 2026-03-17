import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

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
import { SubTeamController } from './sub-teams/sub-team.controller';
import { SubTeamService } from './sub-teams/sub-team.service';

// Sub-team Members
import { SubTeamMembersController } from './members/sub-team-members.controller';
import { SubTeamMembersService } from './members/sub-team-members.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    GroupsController,
    TeamsController,
    MembersController,
    TeamRoleTypesController,
    GlobalRoleTypesController,   
    UserRolesController, 
    SubTeamController,
    SubTeamMembersController,    
  ],
  providers: [
    GroupsService,
    TeamsService,
    MembersService,
    TeamRoleTypesService,
    GlobalRoleTypesService,      
    UserRolesService,
    SubTeamService,   
    SubTeamMembersService,         
  ],
})
export class OrgModule {}