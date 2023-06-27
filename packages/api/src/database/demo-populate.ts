process.env['NODE_CONFIG_DIR'] = './packages/api/config';
import { PrivilegeCode, RoleType } from '@edanalytics/models';
import {
  AppLauncher,
  Oidc,
  Privilege,
  Role,
  Sbe,
  Tenant,
  User,
  UserTenantMembership,
} from '@edanalytics/models-server';
import { generateFake } from '@edanalytics/utils';
import { faker } from '@faker-js/faker';
import colors from 'colors/safe';
import * as _ from 'lodash';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import typeormConfig from './typeorm.config';
import config from 'config';

const run = async () => {
  await config.DB_ENCRYPTION_SECRET;
  const db = new DataSource({
    ...typeormConfig,
    synchronize: false,
    url: await config.DB_CONNECTION_STRING,
  });
  await db.initialize();
  await db.synchronize(true);
  db.transaction(async (dataSource) => {
    const userRepository = dataSource.getRepository(User);

    const privilegeCodes: PrivilegeCode[] = [
      'me:read',
      'ownership:read',
      'ownership:update',
      'ownership:delete',
      'ownership:create',
      'privilege:read',
      'user:read',
      'user:update',
      'user:delete',
      'user:create',
      'role:read',
      'role:update',
      'role:delete',
      'role:create',
      'sbe:read',
      'sbe:update',
      'sbe:delete',
      'sbe:create',
      'ods:read',
      'edorg:read',
      'tenant:read',
      'tenant:update',
      'tenant:delete',
      'tenant:create',
      'sbe:refresh-resources',
      'user-tenant-membership:read',
      'user-tenant-membership:update',
      'user-tenant-membership:delete',
      'user-tenant-membership:create',
      'tenant.ownership:read',
      'tenant.role:read',
      'tenant.role:update',
      'tenant.role:delete',
      'tenant.role:create',
      'tenant.user:read',
      'tenant.user-tenant-membership:read',
      'tenant.user-tenant-membership:update',
      'tenant.user-tenant-membership:delete',
      'tenant.user-tenant-membership:create',
      'tenant.sbe:read',
      'tenant.sbe:refresh-resources',
      'tenant.sbe.vendor:read',
      'tenant.sbe.vendor:update',
      'tenant.sbe.vendor:delete',
      'tenant.sbe.vendor:create',
      'tenant.sbe.claimset:read',
      'tenant.sbe.claimset:update',
      'tenant.sbe.claimset:delete',
      'tenant.sbe.claimset:create',
      'tenant.sbe.ods:read',
      'tenant.sbe.edorg:read',
      'tenant.sbe.edorg.application:read',
      'tenant.sbe.edorg.application:update',
      'tenant.sbe.edorg.application:delete',
      'tenant.sbe.edorg.application:create',
      'tenant.sbe.edorg.application:reset-credentials',
    ];

    const privileges = await dataSource.getRepository(Privilege).save(
      privilegeCodes.map(
        (c): Privilege => ({
          code: c as PrivilegeCode,
          description: c,
          name: _.reverse(c.split(':'))
            .map((str) => str.charAt(0).toLocaleUpperCase() + str.slice(1))
            .join(' '),
        })
      )
    );
    const privilegesMap = new Map<PrivilegeCode, Privilege>();
    privileges.forEach((p) => privilegesMap.set(p.code, p));

    const baseRole = await dataSource.getRepository(Role).save({
      name: 'Standard tenant user',
      type: RoleType.UserGlobal,
      privileges: privileges.filter((p) => p.code === 'me:read'),
    });

    const adminRole = await dataSource.getRepository(Role).save({
      name: 'Global admin',
      type: RoleType.UserGlobal,
      privileges: privileges,
    });

    const globalViewer = await dataSource.getRepository(Role).save({
      name: 'Global viewer',
      type: RoleType.UserGlobal,
      privileges: privileges.filter((p) => p.code.endsWith(':read')),
    });

    const users = await userRepository.save(
      generateFake(
        User,
        {
          role: baseRole,
        },
        130
      )
    );

    const tenants = await dataSource.getRepository(Tenant).save(
      generateFake(
        Tenant,
        () => ({
          createdBy: faker.helpers.arrayElement(users),
        }),
        25
      )
    );

    const sbes = await dataSource.getRepository(Sbe).save(
      generateFake(
        Sbe,
        () => ({
          createdBy: faker.helpers.arrayElement(users),
        }),
        2
      )
    );

    if (config.SAMPLE_SBE_CONFIG) {
      await dataSource.getRepository(Sbe).save({
        configPrivate: config.SAMPLE_SBE_CONFIG,
        configPublic: { hasOdsRefresh: false },
        envLabel: 'test-env-label',
      });
    }

    if (config.SAMPLE_OIDC_CONFIG) {
      await dataSource.getRepository(Oidc).save(config.SAMPLE_OIDC_CONFIG);
    }

    if (config.SAMPLE_APP_LAUNCHER_CONFIG) {
      await dataSource
        .getRepository(AppLauncher)
        .save(config.SAMPLE_APP_LAUNCHER_CONFIG);
    }

    const upwardInheritancePrivileges = privileges.filter((p) =>
      [
        'tenant.sbe:read',
        'tenant.sbe.ods:read',
        'tenant.sbe.edorg:read',
        'tenant.sbe.claimset:read',
        'tenant.sbe.vendor:read',
      ].includes(p.code)
    );

    const ownershipRoles = await dataSource.getRepository(Role).save([
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
    const tenantUserRoles = await dataSource.getRepository(Role).save([
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

    await dataSource.getRepository(UserTenantMembership).save(
      users.flatMap((user) => {
        const tenantsNoReplacement = faker.helpers.shuffle([...tenants]);
        return generateFake(
          UserTenantMembership,
          () => ({
            createdBy: faker.helpers.arrayElement(users),
            tenant: tenantsNoReplacement.shift(),
            role: _.sample([undefined, ...tenantUserRoles, ...tenantUserRoles]),
            user,
          }),
          faker.datatype.number(5)
        );
      })
    );

    console.log(colors.green('\nDone.'));
  });
};
run();
