import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

// import { UserRolesController } from './user-roles.controller';
// import { UserRolesService } from './user-roles.service';
import { UserPermissionsController } from './user-permissions.controller';
import { UserPermissionsService } from './user-permissions.service';
import { UserScopeController } from './user-scope.controller';
import { UserScopeService } from './user-scope.service';

@Module({
  controllers: [
    UsersController,
    // UserRolesController,
    UserPermissionsController,
    UserScopeController,
  ],
  providers: [
    UsersService,
    // UserRolesService,
    UserPermissionsService,
    UserScopeService,
    PrismaService,
  ],
  exports: [UsersService],
})
export class UsersModule {}