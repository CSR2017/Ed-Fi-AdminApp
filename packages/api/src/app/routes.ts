import { Routes } from '@nestjs/core';
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
import { SbesGlobalModule } from '../sbes-global/sbes-global.module';
import { OwnershipsGlobalModule } from '../ownerships-global/ownerships-global.module';
import { TenantsGlobalModule } from '../tenants-global/tenants-global.module';
import { UsersGlobalModule } from '../users-global/users-global.module';
import { UserTenantMembershipsGlobalModule } from '../user-tenant-memberships-global/user-tenant-memberships-global.module';
import { OdssGlobalModule } from '../sbes-global/odss-global/odss-global.module';
import { EdorgsGlobalModule } from '../sbes-global/edorgs-global/edorgs-global.module';
import { RolesGlobalModule } from '../roles-global/roles-global.module';

export const routes: Routes = [
  {
    path: 'tenants',
    module: TenantsModule,
    children: [
      {
        path: ':tenantId/sbes',
        module: SbesModule,
        children: [
          {
            path: '/:sbeId/odss',
            module: OdssModule,
          },
          {
            path: '/:sbeId/edorgs',
            module: EdorgsModule,
          },
          {
            path: '/:sbeId',
            module: StartingBlocksModule,
          },
        ],
      },
      {
        path: ':tenantId/users',
        module: UsersModule,
      },
      {
        path: ':tenantId/user-tenant-memberships',
        module: UserTenantMembershipsModule,
      },
      {
        path: ':tenantId/roles',
        module: RolesModule,
      },
      {
        path: ':tenantId/ownerships',
        module: OwnershipsModule,
      },
    ],
  },
  {
    path: 'privileges',
    module: PrivilegesModule,
  },
  {
    path: 'sbes',
    module: SbesGlobalModule,
    children: [
      {
        path: '/:sbeId/odss',
        module: OdssGlobalModule,
      },
      {
        path: '/:sbeId/edorgs',
        module: EdorgsGlobalModule,
      },
    ],
  },
  {
    path: 'ownerships',
    module: OwnershipsGlobalModule,
  },
  {
    path: 'tenants',
    module: TenantsGlobalModule,
  },
  {
    path: 'roles',
    module: RolesGlobalModule,
  },
  {
    path: 'users',
    module: UsersGlobalModule,
  },
  {
    path: 'user-tenant-memberships',
    module: UserTenantMembershipsGlobalModule,
  },
];
