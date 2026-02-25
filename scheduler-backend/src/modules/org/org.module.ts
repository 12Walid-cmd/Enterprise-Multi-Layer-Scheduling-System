import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';

import { GroupsController } from './groups/groups.controller';
import { GroupsService } from './groups/groups.service';

import { TeamsController } from './teams/teams.controller';
import { TeamsService } from './teams/teams.service';

import { MembersController } from './members/members.controller';
import { MembersService } from './members/members.service';

import { RoleTypesController } from './roles/role-types.controller';
import { RoleTypesService } from './roles/role-types.service';

import { UserRolesController } from './roles/user-roles.controller';
import { UserRolesService } from './roles/user-roles.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    GroupsController,
    TeamsController,
    MembersController,
    RoleTypesController,
    UserRolesController,
  ],
  providers: [
    GroupsService,
    TeamsService,
    MembersService,
    RoleTypesService,
    UserRolesService,
  ],
})
export class OrgModule {}

