# Starting Blocks Admin App

## Running locally

### Environment

Duplicate the `.copyme` files at the following locations, removing that part of the name:

- [packages/fe/.copyme.env.local](./packages/fe/.copyme.env.local)
- [packages/api/config/local-development.js.copyme](./packages/api/config/local-development.js.copyme)
  - Generate for yourself a new encryption key and initialization vector, to be used in the config file above. These are used to encrypt (at rest) the Ed-Fi Admin API credentials, which are particularly sensitive.

    ```shell
    node -e "console.log('KEY: '+ require('crypto').randomBytes(32).toString('hex')+'\nIV: '+require('crypto').randomBytes(16).toString('hex'))"
    ```

  - Ask Bjorn or Eshara for the "SB Meta IAM key and secret" (`sbeMetaSecret`) and an "Ed-Fi Admin API key and secret" (`adminApiSecret`). They may give you secrets corresponding to the keys already in the example config, or you may get new keys as well.

### External dependencies

**Keycloak as an identity provider:**

1. Clone the [local IdP repo](https://github.com/edanalytics/keycloak_local_idp_se.git):
   ```
   git clone https://github.com/edanalytics/keycloak_local_idp_se.git
   ```
1. Copy the [sbaa-keycloak-config.local.yml](./sbaa-keycloak-config.local.yml) file from this repository into the `/config` folder of the IdP one. This new file adds a "Starting Blocks Admin App" identity client to the Realm set up by the default `config.yml` file that will already be there.
1. In the IdP repo, run `docker compose up`.
1. (optional) Go to [http://localhost:8080/realms/example/account](http://localhost:8080/realms/example/account) and log in with one of the credentials suggested by Keeper (teacher, principal, or admin).

You now have a local identity provider running with a configuration that matches what's in the `SAMPLE_OIDC_CONFIG` variable you set up in the preceding section.

**VS Code extensions:**

1. Install the VS Code extensions recommended for this repository.

### Send it

1. Run `docker compose up` in this repo to start Postgres.
1. Run `npm i`
1. Find the `serve` _"Generate & run target"_ in the Nx Console extension, and use it to run the app (you may have to click the &#x21BB; button to the right of that heading in order to see `serve` appear):
   - API
   - FE
1. Go to http://localhost:4200 and log in.
1. Give your new user a role.
   1. Open the SQLTools extension and view the `user` table to find your row.
   1. Run a query such as this one to set your role. You'll need to log out and back in for it to take effect.
      ```sql
      UPDATE "user" SET "roleId" = 2 WHERE id = 123
      ```
1. Start Storybook if you want with the Nx `storybook` target

> ## Possible issues
>
> ### Authorization
>
> Did you give your user a role? By default new users get created with `null` roles.
>
> ### Authentication
>
> The login process relies on SBAA and some IdP being correctly configured for each other. In production this is an ad-hoc manual process. For local development we've included some defaults. SBAA's half of this config is the `OIDC_SAMPLE_CONFIG: {...}` value. The IdP half is [sbaa-keycloak-config.local.yml](./sbaa-keycloak-config.local.yml).
>
> - If you don't provide the sample config values, you won't get any IdPs configured.
> - If the app doesn't have any IdPs configured, it will error out when trying to redirect you to one of them. This is temporary. We haven't decided yet how to design the _real_ login process, so it's self-consciously junk at the moment.
> - OIDC is a standard, but the tokens from different identity providers still look different. If you set up an IdP other than the keycloak one talked about here, you may find that the `oidc.strategy.ts` file needs to be looking in a different spot for First Name or Username or other things. Our long-term architecture for this is TBD. You also might need to do some digging to find which `scope` is needed (the config table has a column for that) in order for the IdP to make available the information you want.
>
> ### CORS
>
> One other possible issue is related to CORS. You can access the app either via hostname (`localhost`) or IP (`127.0.0.1`), but your `FE_URL` config value will only match one of those. Make sure you don't wind up putting one in your config file but the other in your browser.

## Vertical slice

You will follow a single database entity through all the layers of the app's architecture.

### 1. Model definitions

The entity is defined by a shared library. It consists of an interface, a set of DTOs which implement derived versions of the interface, and an ORM class which also implements a version of the interface. Having so many separate interfaces, classes, and DTOs is a pain. It _looks_ like a lot of duplicated code. However, (a) there are subtle differences and it's not as WET as it looks, and (b) these models centralize a lot of really important business definitions.

- [Interface](./packages/models/src/interfaces/sbe.interface.ts#L25)
- [ORM class](./packages/models-server/src/entities/sbe.entity.ts#L16)
- [DTOs](./packages/models/src/dtos/sbe.dto.ts#L63)

### 2. Server

The parts you care most about are the controller and service, where the business operations happen. Other than those, there are several places where you just have to import the entity or its module to actually hook things up and configure routing.

- Initialization
  - [ORM config](./packages/api/src/database/typeorm.config.ts#L17)
  - [Routing](./packages/api/src/app/routes.ts#L68)
  - [Module import](./packages/api/src/app/app.module.ts#L48)
  - [Module](./packages/api/src/sbes-global/sbes-global.module.ts)
- Authorization
  - Caching
    - [Resource privilege caching](./packages/api/src/auth/auth.service.ts#L197)
    - [ABAC ability creation](./packages/api/src/auth/authorization/authorized.guard.ts#L73)
  - [Auth request](./packages/api/src/sbes-global/sbes-global.controller.ts#L45)
  - [Auth evaluation](./packages/api/src/auth/authorization/authorized.guard.ts#L130)
- Business logic
  - [Controller](./packages/api/src/sbes-global/sbes-global.controller.ts#L51)
  - [Service](./packages/api/src/sbes-global/sbes-global.service.ts#L32)

### 3. Client

- [Queries](./packages/fe/src/app/api/queries/queries.ts#L383)
- Routing
  - [Add to app](./packages/fe/src/app/routes/index.tsx#L193)
  - [Route definition](./packages/fe/src/app/routes/sbe-global.routes.tsx#L48)
- Page
  - [Main](./packages/fe/src/app/Pages/SbeGlobal/SbeGlobalPage.tsx#L178)
  - [Edit](./packages/fe/src/app/Pages/SbeGlobal/EditSbeGlobal.tsx#L54)
    - [Form validation](./packages/fe/src/app/Pages/SbeGlobal/EditSbeGlobal.tsx#L27)

### 4. Plumbing

Buried in and around the obvious things like files named `sbes.controller.ts` are a bunch of non-obvious things that make the app work:

- The `toGet<Entity Name>Dto()` helpers used throughout the controllers. These transform the TypeORM classes into the GET DTO classes that the front-end expects (or, more immediately, that the global pipe expects).
- Global DTO transformation and validation. The `main.ts` file in the back-end sets up a global pipe that operates both on requests and responses:
  - On requests, it looks for the Body decorator in the route handler. If this has a class type annotation (e.g. `@Body() sbe: PostSbeDto`), it runs deserialization with `class-transformer` and validation with `class-validator` using that class.
  - On responses, it looks for whether the value returned from the handler is a class. If so, it uses it to serialize the value with `class-transformer`.
- Authentication handlers and global guard, which are described by [their own README](./packages/api/src/auth/login/README.md).
- Authorization, which is also its own big topic.
- Reusable API client that supports serialization and deserialization, reduces arrays to objects, and standardizes failure modes.
- The `react-query` factory used to configure standard CRUD for each entity.
- Front-end error boundary that catches query failures, among other things.
- Form validation powered by `react-hook-form` and DTOs with `class-validator` annotations.

<img style="width: 13em; background: white;" src="./request-roundtrip.svg"/>

### Deep dives
