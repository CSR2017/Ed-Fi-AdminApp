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
} from '@edanalytics/models';

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
    baseResourcePrivilegesMap[resource].forEach((possiblePrivilege) => {
      if (privileges.has(possiblePrivilege)) {
        const idToCache = trueOnlyPrivileges.has(possiblePrivilege) ? true : id;
        addIdTo(cache, possiblePrivilege, idToCache);
      }
    });
  } else {
    sbeResourcePrivilegesMap[resource].forEach((possiblePrivilege) => {
      if (privileges.has(possiblePrivilege)) {
        const idToCache = trueOnlyPrivileges.has(possiblePrivilege) ? true : id;
        addIdTo(cache, possiblePrivilege, idToCache, sbeId);
      }
    });
  }
}
