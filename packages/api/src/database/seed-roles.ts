import { PrivilegeCode, RoleType } from '@edanalytics/models';
import { Privilege, Role } from '@edanalytics/models-server';
import { Logger } from '@nestjs/common';
import colors from 'colors/safe';
import * as _ from 'lodash';
import 'reflect-metadata';
import { EntityManager } from 'typeorm';

export const seedRoles = async (db: EntityManager) => {
  console.log('');
  Logger.log(colors.cyan('Seeding roles.'));

  const privileges = await db.getRepository(Privilege).find();

  const privilegesMap = new Map<PrivilegeCode, Privilege>();
  privileges.forEach((p) => privilegesMap.set(p.code, p));

  const baseRole = await db.getRepository(Role).save({
    name: 'Standard tenant user',
    type: RoleType.UserGlobal,
    privileges: [privileges.find((p) => p.code === 'me:read')],
  });

  const adminRole = await db.getRepository(Role).save({
    name: 'Global admin',
    type: RoleType.UserGlobal,
    privileges: privileges,
  });

  const globalViewer = await db.getRepository(Role).save({
    name: 'Global viewer',
    type: RoleType.UserGlobal,
    privileges: privileges.filter((p) => p.code.endsWith(':read')),
  });

  const upwardInheritancePrivileges = privileges.filter((p) =>
    [
      'tenant.sbe:read',
      'tenant.sbe.ods:read',
      'tenant.sbe.edorg:read',
      'tenant.sbe.claimset:read',
      'tenant.sbe.vendor:read',
    ].includes(p.code)
  );

  const ownershipRoles = await db.getRepository(Role).save([
    {
      name: 'Shared-instance ownership',
      type: RoleType.ResourceOwnership,
      privileges: [
        ...upwardInheritancePrivileges,
        privilegesMap.get('tenant.sbe.edorg.application:read'),
        privilegesMap.get('tenant.sbe.edorg.application:update'),
        privilegesMap.get('tenant.sbe.edorg.application:create'),
        privilegesMap.get('tenant.sbe.edorg.application:delete'),
        privilegesMap.get('tenant.sbe.edorg.application:reset-credentials'),
      ],
    },
    {
      name: 'Full ownership',
      type: RoleType.ResourceOwnership,
      privileges: [
        ...upwardInheritancePrivileges,
        privilegesMap.get('tenant.sbe.vendor:update'),
        privilegesMap.get('tenant.sbe.vendor:create'),
        privilegesMap.get('tenant.sbe.vendor:delete'),
        privilegesMap.get('tenant.sbe.claimset:update'),
        privilegesMap.get('tenant.sbe.claimset:create'),
        privilegesMap.get('tenant.sbe.claimset:delete'),
        privilegesMap.get('tenant.sbe.edorg.application:read'),
        privilegesMap.get('tenant.sbe.edorg.application:update'),
        privilegesMap.get('tenant.sbe.edorg.application:create'),
        privilegesMap.get('tenant.sbe.edorg.application:delete'),
        privilegesMap.get('tenant.sbe.edorg.application:reset-credentials'),
      ],
    },
  ]);
  const tenantUserRoles = await db.getRepository(Role).save([
    {
      name: 'Full access',
      type: RoleType.UserTenant,
      privileges: privileges.filter((p) => p.code.startsWith('tenant.')),
    },
    {
      name: 'Read-only',
      type: RoleType.UserTenant,
      privileges: [
        ...upwardInheritancePrivileges,
        privilegesMap.get('tenant.role:read'),
        privilegesMap.get('tenant.user:read'),
        privilegesMap.get('tenant.user-tenant-membership:read'),
        privilegesMap.get('tenant.sbe.edorg.application:read'),
      ],
    },
    {
      name: 'Credential management lite',
      type: RoleType.UserTenant,
      privileges: [
        ...upwardInheritancePrivileges,
        privilegesMap.get('tenant.role:read'),
        privilegesMap.get('tenant.user:read'),
        privilegesMap.get('tenant.user-tenant-membership:read'),
        privilegesMap.get('tenant.sbe.edorg.application:read'),
        privilegesMap.get('tenant.sbe.edorg.application:update'),
        privilegesMap.get('tenant.sbe.edorg.application:create'),
        privilegesMap.get('tenant.sbe.edorg.application:reset-credentials'),
      ],
    },
  ]);

  const logs = {
    'User global roles': [baseRole, adminRole, globalViewer],
    'User tenant roles': tenantUserRoles,
    'Resource ownership roles': ownershipRoles,
  };

  Object.entries(logs).forEach(([heading, roles]) => {
    Logger.log(colors.cyan(`- ${heading}:`));
    roles.forEach((r) => {
      Logger.log(colors.cyan(`  - ${r.name}`));
    });
  });

  Logger.log(colors.cyan('Done.'));
};
