import { Edorg, Ods, Ownership, Sbe, User } from '@edanalytics/models-server';
import { Module } from '@nestjs/common';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuthorizedGuard } from '../auth/authorization/authorized.guard';
import { AuthenticatedGuard } from '../auth/login/authenticated.guard';
import typeormConfig from '../database/typeorm.config';
import { EdorgsModule } from '../tenants/sbes/edorgs/edorgs.module';
import { OdssModule } from '../tenants/sbes/odss/odss.module';
import { OwnershipsModule } from '../tenants/ownerships/ownerships.module';
import { PrivilegesModule } from '../privileges/privileges.module';
import { RolesModule } from '../tenants/roles/roles.module';
import { SbesModule } from '../tenants/sbes/sbes.module';
import { StartingBlocksModule } from '../tenants/sbes/starting-blocks/starting-blocks.module';
import { TenantsModule } from '../tenants/tenants.module';
import { UserTenantMembershipsModule } from '../tenants/user-tenant-memberships/user-tenant-memberships.module';
import { UsersModule } from '../tenants/users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { routes } from './routes';
import { SbesGlobalModule } from '../sbes-global/sbes-global.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormConfig),
    TypeOrmModule.forFeature([User, Sbe, Ods, Edorg, Ownership]),
    RouterModule.register(routes),
    AuthModule,
    UsersModule,
    TenantsModule,
    UserTenantMembershipsModule,
    OwnershipsModule,
    SbesModule,
    OdssModule,
    EdorgsModule,
    StartingBlocksModule,
    RolesModule,
    PrivilegesModule,
    SbesGlobalModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticatedGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizedGuard,
    },
  ],
})
export class AppModule {}
