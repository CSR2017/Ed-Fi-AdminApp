import { ITenantCache, PrivilegeCode } from '@edanalytics/models';
import {
  Edorg,
  Ods,
  Ownership,
  Sbe,
  User,
  UserTenantMembership,
} from '@edanalytics/models-server';
import { faker } from '@faker-js/faker';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository, TreeRepository } from 'typeorm';
import { cacheAccordingToPrivileges } from './authorization/tenant-cache.interface';

@Injectable()
export class AuthService {
  edorgsTreeRepository: TreeRepository<Edorg>;
  constructor(
    @InjectRepository(Ods)
    private odssRepository: Repository<Ods>,
    @InjectRepository(Sbe)
    private sbesRepository: Repository<Sbe>,
    @InjectRepository(Edorg)
    private edorgsRepository: Repository<Edorg>,
    @InjectRepository(Ownership)
    private ownershipsRepository: Repository<Ownership>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(UserTenantMembership)
    private utmRepo: Repository<UserTenantMembership>,
    @InjectEntityManager()
    private entityManager: EntityManager
  ) {
    this.edorgsTreeRepository = this.entityManager.getTreeRepository(Edorg);
  }

  async getUserPrivileges(userId: number, tenantId?: number) {
    const privileges = new Set<PrivilegeCode>();

    if (tenantId !== undefined) {
      const membership = await this.utmRepo.findOne({
        where: {
          userId,
          tenantId,
        },
        relations: ['role', 'role.privileges'],
      });

      membership?.role?.privileges?.forEach(({ code }) => {
        if (code.startsWith('tenant.')) {
          privileges.add(code);
        }
      });
    }
    const user = await this.usersRepo.findOneOrFail({
      where: {
        id: userId,
      },
      relations: ['role', 'role.privileges'],
    });

    user.role?.privileges?.forEach(({ code }) => {
      privileges.add(code);
    });
    return privileges;
  }

  private async getUser(username: string) {
    const user = await this.usersRepo.findOne({
      where: { username },
      relations: [
        'userTenantMemberships',
        'userTenantMemberships.role',
        'userTenantMemberships.tenant',
        'role',
      ],
    });

    if (user === null) return null;

    return user;
  }

  async findOrCreateUser(user: Partial<User> & Pick<User, 'username'>) {
    const foundUser = await this.getUser(user.username);
    if (foundUser) {
      return foundUser;
    } else {
      const [_, userCount] = await this.usersRepo.findAndCount();
      const newUser = await this.usersRepo.save({
        ...user,
        isActive: false,
        roleId: userCount === 0 ? 2 : 1, // first user is admin
      });
      return await this.getUser(newUser.username);
    }
  }

  validateUser(username: string) {
    return this.getUser(username);
  }

  async buildTenantOwnershipCache(tenantId: number) {
    const timerKey = faker.datatype.string(4);
    console.time('cache ' + timerKey);
    if (typeof tenantId !== 'number') throw new UnauthorizedException();
    const ownerships = await this.ownershipsRepository.find({
      where: {
        tenantId,
      },
      relations: ['sbe', 'ods', 'edorg', 'role', 'role.privileges'],
    });

    const ownedOdss: Ownership[] = [];
    const ownedEdorgs: Ownership[] = [];

    const sbePrivileges = new Map<number, Set<PrivilegeCode>>();
    const odsPrivileges = new Map<number, Set<PrivilegeCode>>();
    const edorgPrivileges = new Map<number, Set<PrivilegeCode>>();

    ownerships.forEach((o) => {
      if (o.sbe) {
        sbePrivileges.set(
          o.sbe.id,
          new Set(o.role.privileges.map((p) => p.code))
        );
      } else if (o.ods) {
        odsPrivileges.set(
          o.ods.id,
          new Set(o.role.privileges.map((p) => p.code))
        );
        ownedOdss.push(o);
      } else if (o.edorg) {
        edorgPrivileges.set(
          o.edorg.id,
          new Set(o.role.privileges.map((p) => p.code))
        );
        ownedEdorgs.push(o);
      }
    });

    const cache: ITenantCache = {
      'tenant.ownership:read': true,
      'tenant.role:read': true,
      'tenant.role:create': true,
      'tenant.role:update': true,
      'tenant.role:delete': true,
      'tenant.user:read': true,
      'tenant.user-tenant-membership:read': true,
      'tenant.user-tenant-membership:update': true,
      'tenant.user-tenant-membership:delete': true,
      'tenant.user-tenant-membership:create': true,
      'tenant.sbe:read': new Set(),
    };

    const cacheEdorgPrivileges = (
      cache: ITenantCache,
      initialPrivileges: Set<PrivilegeCode>,
      edorg: Edorg
    ) => {
      const myPrivileges = new Set(initialPrivileges.values()); // so the other ODS's iterations use SBE's original privileges
      const ownership = edorgPrivileges.get(edorg.id);
      if (ownership) {
        [...ownership.values()].forEach((p) => myPrivileges.add(p));
      }
      cacheAccordingToPrivileges(
        cache,
        myPrivileges,
        'tenant.sbe.edorg',
        edorg.id,
        edorg.sbeId
      );
      cacheAccordingToPrivileges(
        cache,
        myPrivileges,
        'tenant.sbe.edorg.application',
        edorg.educationOrganizationId,
        edorg.sbeId
      );
      edorg.children?.forEach((childEdorg) =>
        cacheEdorgPrivileges(cache, myPrivileges, childEdorg)
      );
    };

    /*

    First trace the resource tree _downward_ from the owned resources,
    accumulating more privileges as we go and applying them to the
    resources we encounter.

    */
    const sbePrivilegesEntries = [...sbePrivileges.entries()];
    for (let is = 0; is < sbePrivilegesEntries.length; is++) {
      const [sbeId, myPrivileges] = sbePrivilegesEntries[is];

      cacheAccordingToPrivileges(cache, myPrivileges, 'tenant.sbe', sbeId);
      cacheAccordingToPrivileges(
        cache,
        myPrivileges,
        'tenant.sbe.vendor',
        true,
        sbeId
      );
      cacheAccordingToPrivileges(
        cache,
        myPrivileges,
        'tenant.sbe.claimset',
        true,
        sbeId
      );
      const sbeOdss = await this.odssRepository.findBy({ sbeId });
      for (let io = 0; io < sbeOdss.length; io++) {
        const ods = sbeOdss[io];
        if (!odsPrivileges.has(ods.id)) {
          odsPrivileges.set(ods.id, new Set());
        }
        myPrivileges.forEach((p) => odsPrivileges.get(ods.id)?.add(p));
      }
    }

    const odsPrivilegesEntries = [...odsPrivileges.entries()];
    for (let is = 0; is < odsPrivilegesEntries.length; is++) {
      const [odsId, myPrivileges] = odsPrivilegesEntries[is];

      const ods = await this.odssRepository.findOneBy({ id: odsId });
      cacheAccordingToPrivileges(
        cache,
        myPrivileges,
        'tenant.sbe.ods',
        ods.id,
        ods.sbeId
      );
      const odsEdorgs = await this.edorgsRepository.find({
        where: {
          odsId,
          parentId: IsNull(),
        },
      });
      for (let io = 0; io < odsEdorgs.length; io++) {
        const edorg = odsEdorgs[io];
        if (!edorgPrivileges.has(edorg.id)) {
          edorgPrivileges.set(edorg.id, new Set());
        }
        myPrivileges.forEach((p) => edorgPrivileges.get(edorg.id)?.add(p));
      }
    }

    const edorgPrivilegesEntries = [...edorgPrivileges.entries()];
    for (let is = 0; is < edorgPrivilegesEntries.length; is++) {
      const [edorgId, myPrivileges] = edorgPrivilegesEntries[is];

      const edorg = await this.edorgsRepository.findOneBy({ id: edorgId });
      const tree = await this.edorgsTreeRepository.findDescendantsTree(edorg);
      cacheEdorgPrivileges(cache, myPrivileges, tree);
    }

    const minimumPrivileges = new Set<PrivilegeCode>([
      'tenant.sbe:read',
      'tenant.sbe.ods:read',
      'tenant.sbe.edorg:read',
    ]);
    const upwardInheritancePrivileges = new Set<PrivilegeCode>([
      'tenant.sbe:read',
      'tenant.sbe.ods:read',
      'tenant.sbe.edorg:read',
      'tenant.sbe.claimset:read',
      'tenant.sbe.vendor:read',
    ]);

    /*

    Then trace the tree _upward_ from the owned resources, applying
    at most the upwardly-inheritable privileges.

    */
    for (const edorgId in ownedEdorgs) {
      const ownership = ownedEdorgs[edorgId];
      const edorg = ownership.edorg!;
      const ancestors = await this.edorgsTreeRepository.findAncestors(edorg);

      const ownedPrivileges = new Set(
        ownership.role.privileges.map((p) => p.code)
      );
      const appliedPrivileges = new Set(
        [...ownedPrivileges].filter((p) => upwardInheritancePrivileges.has(p))
      );

      [...minimumPrivileges].forEach((mp) => {
        if (!appliedPrivileges.has(mp)) {
          throw new Error(
            `Resource ownership lacks required permission ${mp}.`
          );
        }
      });

      ancestors.forEach((ancestorEdorg) => {
        cacheAccordingToPrivileges(
          cache,
          appliedPrivileges,
          'tenant.sbe.edorg',
          ancestorEdorg.id,
          ancestorEdorg.sbeId
        );
      });
      cacheAccordingToPrivileges(
        cache,
        appliedPrivileges,
        'tenant.sbe.ods',
        edorg.odsId,
        edorg.sbeId
      );
      cacheAccordingToPrivileges(
        cache,
        appliedPrivileges,
        'tenant.sbe.claimset',
        true,
        edorg.sbeId
      );
      cacheAccordingToPrivileges(
        cache,
        appliedPrivileges,
        'tenant.sbe.vendor',
        true,
        edorg.sbeId
      );
      cacheAccordingToPrivileges(
        cache,
        appliedPrivileges,
        'tenant.sbe',
        edorg.sbeId
      );
    }

    for (const odsId in ownedOdss) {
      const ownership = ownedOdss[odsId];
      const ods = ownership.ods!;

      const ownedPrivileges = new Set(
        ownership.role.privileges.map((p) => p.code)
      );
      const appliedPrivileges = new Set(
        [...ownedPrivileges].filter((p) => upwardInheritancePrivileges.has(p))
      );

      cacheAccordingToPrivileges(
        cache,
        appliedPrivileges,
        'tenant.sbe',
        ods.sbeId
      );
      cacheAccordingToPrivileges(
        cache,
        appliedPrivileges,
        'tenant.sbe.claimset',
        true,
        ods.sbeId
      );
      cacheAccordingToPrivileges(
        cache,
        appliedPrivileges,
        'tenant.sbe.vendor',
        true,
        ods.sbeId
      );
    }
    console.timeEnd('cache ' + timerKey);

    return cache;
  }
}
