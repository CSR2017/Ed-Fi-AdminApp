# E2E testing setup

This directory contains a bunch of stuff to set up the services needed for the end-to-end API tests, including the test cases baked into the app database population script.

## Ed-Fi services

Relevant docs:

- https://techdocs.ed-fi.org/display/ADMINAPI/Admin+API+1.x+-+Docker+installation
- https://techdocs.ed-fi.org/display/ETKB/Ed-Fi+Technical+Suite+Version+Matrix
- https://techdocs.ed-fi.org/display/ETKB/Ed-Fi+Technology+Version+Index
- https://github.com/Ed-Fi-Alliance-OSS/Ed-Fi-ODS-Docker/blob/v6.1-patch1/Compose/pgsql/compose-district-specific-env.example.yml

Here are some things where either the official docs aren't clear or we differ from them:

- Remove pgbouncer
- In order to run two setups concurrently, it's necessary to differentiate the "VIRTUAL_NAME" values between them, and the official default.conf.template for nginx has a mistaken magic string which needs to be fixed by our custom template (hardcoded `/api` for proxy_pass).
- The docs have a typo in the admin database image name. It's `ods-admin-api-db`, not `ods-admin-api-db-admin`.
- The docs aren't completely clear about how versions of the various dependencies relate to each other. The single `TAG` environment variable in the docker repo linked above is misleading and incorrect.
  - Admin API requires v3 of the gateway even if you are on pre-v7 versions of everything else.
  - The ODS and ODS API share a version.
  - Admin API requires a different admin database image than the standard one. The standard one is versioned to match the ODS version, whereas the Admin API one is versioned to match Admin API.
- Add `ODS_API_VERSION` environment variable to the `6.x` Admin API service.

## App database population

The database is restored from a `pgdump` export for each run of the tests. The meaningful business data is mixed up a bit with DDL and TypeORM metadata but is still fairly readable in `copy` statements. This will link will likely rot and go unfixed, but look for the business data somewhere around [line 637](./test-populate.sql#L637), or for the `Here's the real test case data` comment.

The data inserts could be made more readable by further edits away from `pgdump`'s output (e.g. removing the unnecessary timestamps), but the judgement call so far has been that that would just make it more expensive to refactor and comments on the side are good enough.

The script mounted in the postgres docker container and run automatically on startup. If you feel like regenerating it to keep it in sync with some kind of big migration in SBAA, here's advice:

- The output from `pgdump` has DDL at the beginning, `copy`s in the middle, and more DDL-like mutations at the end. Roughly speaking, you should copy the beginning and end as-is from `pgdump` and edit the `copy`s by hand, leaving out `copy`s from `pgdump` that aren't relevant such as `pgboss.archive`. But there are a couple exceptions:
- `pgboss` relies not just on DDL, but also on the row in its `version` table. So keep that around even though it's not business logic per-se.
- `pgdump` doesn't export `CREATE EXTENSION` statements so you need to manage those manually.
- Don't overwrite any of the test case data (including app sessions) with `copy` statements from `pgdump`, except the `pgboss` version.

## Test execution script

The test cases written in [the script](../packages/api/src/app/app.e2e.spec.txt) (or [here](../packages/api/src/app/app.e2e.spec.ts) if you've renamed it to `.ts`) are a jumble of logic. We haven't yet had any wonderful ideas about how to organize them in a more readable or meaningful way. They also form a single indivisible narrative, with many of the cases setting up system state (if they work right, that is) for each subsequent case. The most basic kind of cleanup would be helper-ifying certain parts of the cases such as URLs in order to pull things like `edfiTenantIds` out of hardcoded strings, similar to how the cookie strings are helpfully named. Or helperifying the basic `GET` or `PUT` methods to reduce boilerplate.
