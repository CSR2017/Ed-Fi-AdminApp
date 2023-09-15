# Authorization

## All privileges

(for now ignore the question of exactly which CRUD operations exist in MVP)

```py
me:read

ownership:read
ownership:update
ownership:delete
ownership:create

user:read
user:update
user:delete
user:create

tenant:read

tenant.user:read

tenant.user-tenant-membership:read
tenant.user-tenant-membership:update
tenant.user-tenant-membership:delete
tenant.user-tenant-membership:create

tenant.role:read
tenant.role:update
tenant.role:delete
tenant.role:create

tenant.ownership:read

tenant.sbe:read
tenant.sbe:update
tenant.sbe:delete
tenant.sbe:create

tenant.sbe.vendor:read
tenant.sbe.vendor:update
tenant.sbe.vendor:delete
tenant.sbe.vendor:create

tenant.sbe.claimset:read
tenant.sbe.claimset:update
tenant.sbe.claimset:delete
tenant.sbe.claimset:create

tenant.sbe.ods:read
tenant.sbe.ods:update
tenant.sbe.ods:delete
tenant.sbe.ods:create

tenant.sbe.edorg:read
tenant.sbe.edorg:update
tenant.sbe.edorg:delete
tenant.sbe.edorg:create

tenant.sbe.edorg.application:read
tenant.sbe.edorg.application:update
tenant.sbe.edorg.application:delete
tenant.sbe.edorg.application:create
tenant.sbe.edorg.application:reset-credentials

# Global versions of the above, to be implemented post-MVP:
user-tenant-membership:read
user-tenant-membership:update
user-tenant-membership:delete
user-tenant-membership:create

role:read
role:update
role:delete
role:create

ownership:read

sbe:read
sbe:update
sbe:delete
sbe:create

sbe.vendor:read
sbe.vendor:update
sbe.vendor:delete
sbe.vendor:create

sbe.claimset:read
sbe.claimset:update
sbe.claimset:delete
sbe.claimset:create

sbe.ods:read
sbe.ods:update
sbe.ods:delete
sbe.ods:create

sbe.edorg:read
sbe.edorg:update
sbe.edorg:delete
sbe.edorg:create

sbe.edorg.application:read
sbe.edorg.application:update
sbe.edorg.application:delete
sbe.edorg.application:create
sbe.edorg.application:reset-credentials
```

## Roles

### Standard MVP global role

```
me:read
```

### Standard MVP tenant user role

```
tenant:read

tenant.user:read
tenant.user-tenant-membership:read
tenant.role:read
tenant.ownership:read
tenant.sbe:read
tenant.sbe.vendor:read
tenant.sbe.claimset:read
tenant.sbe.ods:read
tenant.sbe.edorg:read

tenant.sbe.edorg.application:read
tenant.sbe.edorg.application:update
tenant.sbe.edorg.application:delete
tenant.sbe.edorg.application:create
tenant.sbe.edorg.application:reset-credentials
```

### Standard MVP tenant resource ownership role

```
tenant.sbe:read
tenant.sbe.vendor:read
tenant.sbe.claimset:read
tenant.sbe.ods:read
tenant.sbe.edorg:read

tenant.sbe.edorg.application:read
tenant.sbe.edorg.application:update
tenant.sbe.edorg.application:delete
tenant.sbe.edorg.application:create
tenant.sbe.edorg.application:reset-credentials
```

## Tenant ownership cache

Because of the way that permissions bleed both up and down the resource hierarchy from the actual owned item, derivation of the full permission set for a given resource involves tracing the graph all over the place and is quite expensive. In fact, deriving it for one resource basically involves deriving it for all resources. So that's what we do, and then we cache the result.

The cached item for a given privilege can be one of two things:

- A set of IDs, which means the privilege is granted for only the resources whose IDs are present there.
- A boolean `true` value, which means not that there are _no_ restrictions, but rather that it's the business logic's responsibility to implement them. More on this later, but for now suffice it to say it's used for basically two things:
  - When a tenant really does have access to "all" items within some general scope such as an SBE
  - When the operation involves some kind of business-logic-specific validation that it wouldn't make sense to even attempt to cache, such as payload validation on POST routes.

```js
cache = {
  // tenant-level resources
  'tenant.ownership:read': true,
  'tenant.role:read': true,
  'tenant.user:read': true,
  'tenant.user-tenant-membership:read': true,
  'tenant.sbe:read': new Set([1, 2]),

  // SBE-level resources are an object keyed by sbeId
  'tenant.sbe.ods:read': {
    1: true,
    2: new Set([7, 8]),
  },
  // Application caches actually get educationorganizationids rather than Application ids. This allows us to avoid querying the Admin API when building the cache, because we can get those from Edorgs.
  'tenant.sbe.edorg.application:read': {
    1: true,
    2: new Set([4, 5, 6]),
  },
};
```

In the case of the first kind of usage of the `[privilege]: true` result (two kinds listed above the code block), it's used purely for convenience. For instance, we filter Edorgs by `sbeId` using regular ORM methods. It's only if there's something more complicated than that that we use the cache for individual IDs (e.g. ODS-scoped ownerships). The controller always uses the Edorg ID cache, but it does so via a helper that returns an empty filter in the case of `true`.

Just to be clear, **_it's the responsibility of the controllers or services to actually implement these various filters which are considered external to the authorization cache._** These will almost always be one of two basic `where` clauses:

- `where sbeId = :sbeId`, or
- `where tenantId = :tenantId`.

On the other hand, the second kind of usage of the `true` result is not for logic that's simple, so much as it's for logic that is too tangled up in business behavior to reasonably be owned by the authorization service. You might have several relational IDs in a single POST payload, all of which need to be validated against the tenant's ownerships. The controller or service will likely refer to the cache for those related resources, but in principle the logic could be arbitrary. The cache for the creation action would just be `true`, but that doesn't mean there are no restrictions.

### Ownership cache technical notes

Memory size:

- There are about 1,200 LEAs in Texas, and 11,000 Schools. We don't plan to load any Edorgs below the level of School, so call it 12,200 in total... actually just call it 10k.
- A `Set` of 10,000 numbers in JavaScript is about 280 kB.
- Say there are six copies of the 10,000 IDs, five for Application privileges and one for `edorg:read`. That would be about 1.7 MB of memory. Not a disaster.
- In conclusion, memory size doesn't seem like a major concern.

Upon receipt of a request by a tenant whose cache is not already loaded, we need to load the cache. Once that load has started, we don't want to re-start it if another request for that tenant comes in before it's done. This necessitates statefulness. The current solution is to use an in-memory JavaScript cache which supports promises. This is significantly nicer to use than one which necessitates polling, but has the downside of not really supporting multi-instance deployments. So far we think that's not really a concern because each instance can just load its own cache, and given the fairly quick load time (<500ms for TX) and fairly quick expiration, there shouldn't be any real issues.

## User session cache

Users inherit their SB resource access from the tenants they're members of, with privileges possibly narrowed further by their own tenant user role. The tenant ownerships are only cached once for each tenant, but that means each user must have their own unique privileges cached separately &mdash; with the two caches being combined to yield the true final authorization grant for the user. The user cache doesn't involve any of the complicated graph-tracing or privilege derivation that's necessary for the tenant ownership cache; rather, it just holds a basic map of tenant IDs to the user's tenant privileges.

## Using the caches

The reason all the main routes are tenant-specific is to make authorization easier. When a tenant request comes in, we build out the user's privilege cache like this:

```ts
// pseudocode

userCache = intersection(userPrivilegesCache, tenantPrivilegesCache);
```

And their CASL abilities like this:

```ts
define.can('read', 'tenant.sbe.vendor', {
  tenantId: '<id>',
  sbeId: '<id>',
  id: {
    $in: [
      '__filtered__', // special keyword used later
      /* ...values from userCache */
    ],
  },
});
```

Each route has an authorization request configured like this:

```ts
@Get('tenants/:tenantId/sbes/:sbeId/vendors/:vendorId')
@Authorize({
  privilege: Privilege['tenant.sbe.vendor:read'], // enum of known privileges
  subject: {
    tenantId: 'tenantId', // These strings are NestJS path parameter names
    sbeId:'sbeId',
    id: 'vendorId',
  }
})
handler(
  // params...
) {
  // logic...
}
```

Or, for GET-all routes, like this:

```ts
@Get('tenants/:tenantId/sbes/:sbeId/vendors')
@Authorize({
  privilege: Privilege['tenant.sbe.vendor:read'],
  subject: {
    tenantId: 'tenantId',
    sbeId:'sbeId',
    id: '__filtered__', // Tell CASL that the controller will take care of this attribute
  }
})
handler(
  @InjectFilter(Privilege['tenant.sbe.vendor:read']) vendorIds: number[] | true, // Then filter using this array
  // params...
) {
  // logic...
}
```

The `Authorize` and `Injectfilter` implementations aren't shown here, but this is the concept:

- `Authorize`: Uses the `subject` config to construct an object with the right attribute values from the current URL path parameters, and uses that plus the `privilege` config to construct and execute a complete CASL request including action and subject.
- `InjectFilter`: Uses its privilege parameter to look up the appropriate values in the cache and inject them into the handler for use there. It returns an empty array if the privilege isn't present for the user, but the request will be denied by the `Authorize`-configured guard before the handler would use that empty array anyway.

One of the major things to notice is that CASL isn't being given the _real_ entities, as would usually be the case. Instead, it's being given only the authorization-related attributes, and in a format which may or may not really be available in the underlying data model. For example, a Vendor from the Admin API has no such thing as an `sbeId` attribute. The information does exist (in that a Vendor is owned by an SBE), but _not like that_. So anyway, the attributes in the `subject` parameter are a mixture of real relational data model attributes, and synthetic ones created by our business logic.

A wholly different alternative way of implementing authorization would be to retrieve the requested resources from a service, augment the actual return values with the necessary authorization-related attributes discussed above, and then pass the result to CASL for it to be either denied or filtered as appropriate. The problem with that approach is that it would be gratuitously inefficient in certain situations. For example, suppose the entire state of Texas has a single SBE, and each of the thousand districts has their own ODS. That single ODS is all a district is granted ownership of, but this app's routing tree only goes as far as SBE. So each tenant will send requests such as `GET /sbes/:sbeId/edorgs`. If filtering were done _after_ retrieval, we'd be querying an extra 10,000 records. There's no particular reason to do that, because it's perfectly easy to set up the filtering on the way _in_, as described above.

## Creating CASL abilities

We use the cache to create CASL abilities for all the things a user can do. Some of these things come from their global privileges, and some are tenant-scoped. The tenant-scoped abilities are defined by referencing the tenant ownerships cache. The key contribution of the logic that deals specifically with tenant-scoped privileges is that it defines conditions on the CASL _subject_, in the sense of attribute-based access control. For example, the _subject_ will at a minimum be defined with a `tenantId`, and will often also have an `sbeId`:

```ts
{
  tenantId: '<tenant ID>',
  sbeId: '<Sbe ID>',
}
```

If the ID values cache for a given resource is a `Set` (rather than the `true` value), then the _subject_ gets an "in" operator with that list. Also included in the "in" list is the special `__filtered__` value. If the cache is just a `true` value, then there's no additional attribute beyond what's shown above.

```ts
{
  tenantId: '<tenant ID>',
  sbeId: '<Sbe ID>',
  id: {
    $in: [1, 2, '__filtered__'],
  },
}
```

The `__filtered__` option is necessitated by the way CASL works and how we use it. In particular, for `GET all` requests we check CASL once, at the route level, and all we want to know is "do they have the privilege to get _some_ row here". The filtering for _which_ rows is handled outside CASL. We also use the `__filtered__` option for the `GET one` application route, because although we do have the `applicationId` from the route path parameter, we actually cache the `edorgId` instead, and we don't know _that_ value until we get the application back from the Admin API. So that particular single-item route functions like a many-item route.

## Other implementation details

One thing to note about the cache is that even if there aren't any entities for a user to access, we still want the relevant cache item to be present (but empty of course) if they have the relevant privilege. This ensures that they can hit the API route and see the UI page, even if the result is empty data.
