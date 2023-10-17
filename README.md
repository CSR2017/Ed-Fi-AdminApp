# Starting Blocks Admin App

## Running locally

### Environment

Duplicate the `.copyme` files at the following locations, removing that part of the name:

- [packages/fe/.copyme.env.local](./packages/fe/.copyme.env.local)
- [packages/api/config/local-development.js.copyme](./packages/api/config/local-development.js.copyme)

  - Generate for yourself a new encryption key to be used in the config file above. This is used to encrypt (at rest) the Ed-Fi Admin API credentials.

    ```shell
    node -e "console.log('KEY: '+ require('crypto').randomBytes(32).toString('hex'))"
    ```

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
1. Start Storybook if you want with the Nx `storybook` target

> ## Possible issues
>
> - You can only log in if SBAA is successfully connected to some IdP. Check the `oidc` table and check your IdP.
> - You can only log in if the database has been populated with a user and that user is active and has a role.
> - There's not much to do until the app has some data in it.
> - CORS: You can access the app either via hostname (`localhost`) or IP (`127.0.0.1`), but your `FE_URL` config value will only match one of those. Make sure you don't wind up putting one in your config file but the other in your browser.

## Vertical slice

You will follow a single database entity through all the layers of the app's architecture.

### 1. Model definitions

The entity is defined by a shared library. It consists of an interface, a set of DTOs which implement derived versions of the interface, and an ORM class which also implements a version of the interface. Having so many separate interfaces, classes, and DTOs is a pain. It _looks_ like a lot of duplicated code. However, (a) there are subtle differences and it's not as WET as it looks, and (b) these models centralize a lot of really important business definitions.

- [Interface](./packages/models/src/interfaces/sbe.interface.ts#L26)
- [ORM class](./packages/models-server/src/entities/sbe.entity.ts#L14)
- [DTOs](./packages/models/src/dtos/sbe.dto.ts#L44)

### 2. Server

The parts you care most about are the controller and service, where the business operations happen. Other than those, there are several places where you just have to import the entity or its module to actually hook things up and configure routing.

- Initialization
  - [ORM config](./packages/api/src/database/typeorm.config.ts#L33)
  - [Routing](./packages/api/src/app/routes.ts#L71)
  - [Module import](./packages/api/src/app/app.module.ts#L58)
  - [Module](./packages/api/src/sbes-global/sbes-global.module.ts#L22)
- Authorization
  - Caching
    - [Resource privilege caching](./packages/api/src/auth/auth.service.ts#L114)
    - [ABAC ability creation](./packages/api/src/auth/authorization/authorized.guard.ts#L37)
  - [Auth request](./packages/api/src/sbes-global/sbes-global.controller.ts#L56)
  - [Auth evaluation](./packages/api/src/auth/authorization/authorized.guard.ts#L101)
- Business logic
  - [Controller](./packages/api/src/sbes-global/sbes-global.controller.ts#L62)
  - [Service](./packages/api/src/sbes-global/sbes-global.service.ts#L36)

### 3. Client

- [Queries](./packages/fe/src/app/api/queries/queries.ts#L451)
- Routing
  - [Add to app](./packages/fe/src/app/routes/index.tsx#L179)
  - [Route definition](./packages/fe/src/app/routes/sbe-global.routes.tsx#L18)
- Page
  - [Main](./packages/fe/src/app/Pages/SbeGlobal/SbeGlobalPage.tsx#L12)
  - [Edit](./packages/fe/src/app/Pages/SbeGlobal/EditSbe.tsx#L23)
    - [Form validation](./packages/fe/src/app/Pages/SbeGlobal/EditSbe.tsx#L21)

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

**Don't scrutinize this too much, but here's basically what that looks like:**

<img style="width: 13em; background: white;" src="./request-roundtrip.svg"/>

## Monorepo structure

Nx makes it easy to share code between different apps. We're taking advantage of that in one big way right now, which is the shared data models. But outside of that use case we've been very sloppy about putting code into application packages vs library packages. We currently only have one back end and one front end, so "shared" code is mostly just YAGNI. Eventually we might have a separate claimset library app. When/if we do, we'll move all that code around as necessary.
