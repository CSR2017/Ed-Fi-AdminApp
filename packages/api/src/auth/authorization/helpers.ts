import { defineAbility, subject } from '@casl/ability';
import {
  TenantSbePrivilege,
  PrivilegeCode,
  TenantBasePrivilege,
  BasePrivilege,
  ITenantCache,
  SpecificIds,
  TrueValue,
  isSbePrivilege,
  BasePrivilegeResourceType,
  PrivilegeResource,
  SbePrivilegeResourceType,
  baseResourcePrivilegesMap,
  sbeResourcePrivilegesMap,
  trueOnlyPrivileges,
  upwardInheritancePrivileges,
  minimumPrivileges,
  AuthorizationCache,
  Ids,
  isGlobalPrivilege,
} from '@edanalytics/models';
import { Edorg } from '@edanalytics/models-server';
import { createEdorgCompositeNaturalKey } from '@edanalytics/models';

/**
 * Add a resource ID into the cache of IDs allowable for a specific privilege.
 *
 * @param cache cache to mutate
 * @param privilege privilege against which to cache the id
 * @param id id to cache
 */
export function addIdTo(
  cache: ITenantCache,
  privilege: TenantBasePrivilege,
  id: number | string | TrueValue
): void;
/**
 * Add a resource ID into the cache of IDs allowable for a specific privilege.
 *
 * @param cache cache to mutate
 * @param privilege privilege against which to cache the id
 * @param id id to cache
 * @param sbeId id of the SBE which owns this resource
 */
export function addIdTo(
  cache: ITenantCache,
  privilege: TenantSbePrivilege,
  id: number | string | TrueValue,
  sbeId: number
): void;
export function addIdTo(
  cache: ITenantCache,
  privilege: TenantBasePrivilege | TenantSbePrivilege,
  id: number | string | TrueValue,
  sbeId?: number
): void {
  if (isSbePrivilege(privilege)) {
    if (cache[privilege] === undefined) {
      cache[privilege] = {};
    }
    if (cache[privilege][sbeId] !== true) {
      if (id !== true && !trueOnlyPrivileges.has(privilege)) {
        if (cache[privilege][sbeId] === undefined) {
          cache[privilege][sbeId] = new Set([id]);
        } else {
          (cache[privilege][sbeId] as SpecificIds).add(id);
        }
      } else {
        cache[privilege][sbeId] = true;
      }
    }
  } else {
    const cachedIds = cache[privilege];
    if (cachedIds !== true) {
      if (id !== true) {
        if (cache[privilege] === undefined) {
          (cache[privilege] as SpecificIds) = new Set([id]);
        } else {
          cachedIds.add(id);
        }
      } else {
        cache[privilege] = id;
      }
    }
  }
}

/**
 * Cache an allowable ID against all granted privileges on its resource type.
 *
 * @param cache cache to mutate
 * @param privileges all granted privileges, or at least all relevant ones
 * @param resource resource type
 * @param id id to cache
 */
export function cacheAccordingToPrivileges(
  cache: ITenantCache,
  privileges: Set<PrivilegeCode | TenantBasePrivilege | TenantSbePrivilege>,
  resource: BasePrivilegeResourceType,
  id: number | string | TrueValue
);
/**
 * Cache an allowable ID against all granted privileges on its resource type.
 *
 * @param cache cache to mutate
 * @param privileges all granted privileges, or at least all relevant ones
 * @param resource resource type
 * @param id id to cache
 * @param sbeId id of the SBE which owns the resource
 */
export function cacheAccordingToPrivileges(
  cache: ITenantCache,
  privileges: Set<PrivilegeCode | TenantBasePrivilege | TenantSbePrivilege>,
  resource: SbePrivilegeResourceType,
  id: number | string | TrueValue,
  sbeId: number
);
export function cacheAccordingToPrivileges(
  cache: ITenantCache,
  privileges: Set<PrivilegeCode | TenantBasePrivilege | TenantSbePrivilege>,
  resource: PrivilegeResource,
  id: number | string | TrueValue,
  sbeId?: number
) {
  if (resource in baseResourcePrivilegesMap) {
    baseResourcePrivilegesMap[resource]?.forEach((possiblePrivilege) => {
      if (privileges.has(possiblePrivilege)) {
        const idToCache = trueOnlyPrivileges.has(possiblePrivilege) ? true : id;
        addIdTo(cache, possiblePrivilege, idToCache);
      }
    });
  } else {
    sbeResourcePrivilegesMap[resource]?.forEach((possiblePrivilege) => {
      if (privileges.has(possiblePrivilege)) {
        const idToCache = trueOnlyPrivileges.has(possiblePrivilege) ? true : id;
        addIdTo(cache, possiblePrivilege, idToCache, sbeId);
      }
    });
  }
}

/**
 * Climb down the Edorg tree and cache the IDs against the weakly-increasing privilege set. This does _NOT_ do anything about _upward_ inheritance.
 */
export const cacheEdorgPrivilegesDownward = (
  cache: ITenantCache,
  initialPrivileges: Set<PrivilegeCode>,
  edorg: Pick<Edorg, 'id' | 'children' | 'sbeId' | 'odsDbName' | 'educationOrganizationId'>,
  edorgOwnershipPrivileges: Map<number, Set<PrivilegeCode>>
) => {
  const myPrivileges = new Set(initialPrivileges.values()); // so the other ODS's iterations use SBE's original privileges
  const ownership = edorgOwnershipPrivileges.get(edorg.id);
  if (ownership) {
    [...ownership.values()].forEach((p) => myPrivileges.add(p));
  }
  cacheAccordingToPrivileges(cache, myPrivileges, 'tenant.sbe.edorg', edorg.id, edorg.sbeId);
  const compositeKey = createEdorgCompositeNaturalKey({
    odsDbName: edorg.odsDbName,
    educationOrganizationId: edorg.educationOrganizationId,
  });
  cacheAccordingToPrivileges(
    cache,
    myPrivileges,
    'tenant.sbe.edorg.application',
    compositeKey,
    edorg.sbeId
  );
  edorg.children?.forEach((childEdorg) =>
    cacheEdorgPrivilegesDownward(cache, myPrivileges, childEdorg, edorgOwnershipPrivileges)
  );
};

/**
 * Apply privileges from an edorg ownership to its edorg, ods, sbe, vendor, and claimset _ancestors_. Does _NOT_ climb _down_ the edorg tree.
 */
export const cacheEdorgPrivilegesUpward = (
  cache: ITenantCache,
  edorg: Edorg,
  ownedPrivileges: Set<PrivilegeCode>,
  ancestors: Edorg[]
) => {
  const appliedPrivileges = new Set(
    [...ownedPrivileges].filter((p) => upwardInheritancePrivileges.has(p))
  );

  [...minimumPrivileges].forEach((mp) => {
    if (!appliedPrivileges.has(mp)) {
      throw new Error(`Resource ownership lacks required permission ${mp}.`);
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
  cacheAccordingToPrivileges(cache, appliedPrivileges, 'tenant.sbe.ods', edorg.odsId, edorg.sbeId);
  cacheAccordingToPrivileges(cache, appliedPrivileges, 'tenant.sbe.claimset', true, edorg.sbeId);
  cacheAccordingToPrivileges(cache, appliedPrivileges, 'tenant.sbe.vendor', true, edorg.sbeId);
  cacheAccordingToPrivileges(cache, appliedPrivileges, 'tenant.sbe', edorg.sbeId);
};

/**
 * Turn the cachable resource ownership and privilege structure into a CASL ability.
 *
 * @param cache The object containing the union of the user's global privileges and the user-filtered tenant privileges.
 * @param tenantId ID of the tenant
 * @returns CASL ability
 */
export const abilityFromCache = (
  cache: AuthorizationCache,
  tenantId: number | string | undefined
) => {
  const ability = defineAbility((userCan) => {
    Object.keys(cache ?? {}).forEach((privilegeCode: keyof AuthorizationCache) => {
      if (isGlobalPrivilege(privilegeCode)) {
        // global-scoped privilege
        const privilegeCache = cache[privilegeCode];
        if (privilegeCache !== true) {
          throw new Error(
            'Encountered global-scoped privilege cache which is not a blanket `true`, but authorization system is not built to handle this.'
          );
        }
        const caslSubject = {};
        // subject(privilegeCode, caslSubject);
        userCan(privilegeCode, privilegeCode, caslSubject);
      } else {
        // tenant-scoped privilege
        if (tenantId === undefined || tenantId === 'undefined') {
          throw new Error('Attempting to construct tenant ability but no tenantID provided.');
        }

        if (isSbePrivilege(privilegeCode)) {
          // tenant-scoped privilege whose cache is a map of sbes to the Ids type
          const privilegeCache = cache[privilegeCode];
          const sbeIds = Object.keys(privilegeCache);
          sbeIds.forEach((sbeId) => {
            const caslSubject =
              privilegeCache[sbeId] === true
                ? {
                    tenantId: String(tenantId),
                    sbeId: sbeId,
                  }
                : {
                    tenantId: String(tenantId),
                    sbeId: sbeId,
                    id: {
                      $in: ['__filtered__', ...[...privilegeCache[sbeId]].map((v) => String(v))],
                    },
                  };
            // subject('privilegeCode', caslSubject);
            userCan(privilegeCode, privilegeCode, caslSubject);
          });
        } else {
          // tenant-scoped privilege whose cache is the Ids type
          const privilegeCache = cache[privilegeCode];
          const caslSubject =
            privilegeCache === true
              ? {
                  tenantId: String(tenantId),
                }
              : {
                  tenantId: String(tenantId),
                  id: {
                    $in: ['__filtered__', ...[...privilegeCache].map((v) => String(v))],
                  },
                };
          // subject('privilegeCode', caslSubject);
          userCan(privilegeCode, privilegeCode, caslSubject);
        }
      }
    });
  });
  return ability;
};
