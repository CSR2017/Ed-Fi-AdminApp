# Starting Blocks Admin App

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
