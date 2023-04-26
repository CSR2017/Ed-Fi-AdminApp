# CRUD Starter Repo

This repo is very much a WIP, and the expectation is that it will continue to evolve and improve. At the moment it's a bit of a compromise between long-term architecture ideas and immediate production-app needs (see the note about routing below).

There are two major chunks of this repo that shouldn't necessarily make it into a real production app forked from it, but which are helpful for the actual _starter repo_ purpose. First, the front-end routing library used here is still in beta, and it would probably be a good idea to replace it with something more standard like `react-router` for the time being (but soon!...). Second, there is a thing called a "generator" that is used to create loads of boilerplate code for new app pages. See [below](#recommended-usage-of-the-generator) for more on the generator.

**Here are some of the things going on in this [Nx](https://nx.dev/) monorepo:**

- Packages
  - FE
    - React
    - Nx Webpack bundler
    - @tanstack/react-query for main data state management
    - @tanstack/router for routing, plus UI state management in URL query params
    - class-transformer for REST serialization and deserialization
    - class-validator for form validation
    - Chakra-UI
  - API
    - NestJS
    - class-transformer for REST serialization and deserialization
    - class-validator for form validation
    - TypeORM
      - _SQLite by default for simplicity, but intended to be replaced for production_
    - openid-client for OIDC authentication
    - OpenAPI spec
    - Basic fake data population starter script
  - Models (data models shared between FE and API)
    - Entities
      - TypeORM
      - Basic fake data generation config
    - DTOs
      - class-transformer
      - class-validator
    - Interfaces
  - Common UI
    - Chakra-UI theme
    - Table component using @tanstack/react-table
    - "Confirm Action" component to wrap a button with a confirmation modal handler
  - Utils
    - Date formatters
    - Tool to provide and consume the basic fake data generation configs mentioned above in Models and API
- Generators
  - "Resource" generator to create all the various boilerplate files associated with a new data entity
    - Models package
      - Interface
      - TypeORM entity
      - DTOs
        - GET
        - POST
        - PUT
    - API
      - Module
        - Service
        - Controller
      - Basic fake data generation
    - FE
      - Queries and mutations
      - Routes
      - Single-item page
      - Many-items page

**Here are some things _not_ going on, that will need to be added (other than your business logic):**

- Good config setup for both front-end and back-end. Currently it's just synchronous TypeScript exports with file replacement during production builds.
- Docker things for deployment.
- Back-end authorization. Currently it does authentication only.
- GitHub CI workflow.
- And probably lots more...

## How to use it

**Setup:**

1. `npm install`
1. Get the VS Code extensions that will be recommended to you (note: all of the things done below in the `Nx` extension have corresponding CLI commands too.)
1. Create an environment variables file for the API:

   ```ts
   // packages/api/src/environments/environment.local.ts

   export const environment = {
     production: false,
     OAUTH2_CLIENT_PROVIDER_OIDC_ISSUER: 'http://localhost:8080/realms/example',
     OAUTH2_CLIENT_REGISTRATION_LOGIN_CLIENT_ID: 'oidc-client-one',
     OAUTH2_CLIENT_REGISTRATION_LOGIN_CLIENT_SECRET: '<your value>',
     OAUTH2_CLIENT_REGISTRATION_LOGIN_REDIRECT_URI: 'http://localhost:3333/api/auth/oidc/callback',
     OAUTH2_CLIENT_REGISTRATION_LOGIN_SCOPE: '',
   };
   ```

1. Create an environment variables file for the FE:

   ```ts
   // packages/fe/src/environments/environment.local.ts

   export const environment = {
     production: false,
   };
   ```

**Run application:**

1. Go to [packages/api/src/database/demo-populate.ts](packages/api/src/database/demo-populate.ts).
1. Hit <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd> or use the sidebar to open the `Run and Debug` pane.
1. In the dropdown at the top, select `ts-node`, and with the `demo-populate.ts` file open, hit the green run arrow. A new console should open, and you'll have to respond to a couple of prompts.
1. Go to the `Nx Console` pane on the left, and under the `Generate & Run Target` section click `serve` (you may have to use the small &#8635; button to the right of that heading).
   - Choose either `fe` or `api` and click the first option starting with `Execute...`.
   - Then do it again and choose the other `fe` or `api` option.
1. Start up the keycloak server from https://github.com/edanalytics/keycloak_local_idp_se.
1. Log into Keycloak as the admin and get the client secret as described in [that repo's Readme](https://github.com/edanalytics/keycloak_local_idp_se#what-am-i-supposed-to-do-with-this), and paste it into [packages/api/src/environments/environment.local.ts](packages/api/src/environments/environment.local.ts).
1. See the running things:
   - Front-end app at http://localhost:4200.
     - If you want to launch it in debugging mode in order to use breakpoints on FE code, run the `Launch Client` debug configuration.
   - OpenAPI doc from back-end at http://localhost:3333/api (this is a public route).

**Run storybook:**

1. Go to the `Nx Console` pane on the left, and under the `Generate & Run Target` section click `storybook`.
   - Choose `common-ui` from the options and click the option starting with `Execute...`.

**Run the Resource generator:**

1. Go to the `Nx Console` pane on the left, and under the `Generate & Run Target` section click `generate`.

   - Scroll all the way down the resulting options and choose `workspace generator - resource`.

1. You'll get a form with a `Name` input and many checkboxes. The checkboxes control which parts of the generator run. Example use cases:
   - You've written an entity and its corresponding interface and DTOs in the Models package, and you want to generate the rest of the code but leave your models as they are. For this just uncheck the `modelFiles` box.
   - <b color="red">!IMPORTANT!</b> There's no elaborate "smart" behavior to do _other_ things differently when you turn one piece of the generator off &mdash; it just skips that part and assumes in the other parts that those artifacts already exist. For example, it will happily generate a bunch of UI pages for models that don't exist, or queries for API routes that don't exist.

### Recommended usage of the generator

The generator just creates boilerplate. As soon as you start adding real data fields to your models (i.e. beyond the `createdDate`-kind-of-stuff that the generator gets you started with), or authorization decorators to your controllers, or you've moved some API modules to nest inside of others, or you've made any number of other changes that give you your actual business logic, ...once you've done that, you don't want to run the generator again because it will just overwrite your business logic. So think hard about the entities you want, then generate them all, and from that point on don't use the generator again.

**If it's not that useful then why have it at all?**

If you want to design a good architecture it's very helpful to have a running application to test it on. But if your app is substantial enough to be very useful from that perspective, then it's also substantial enough to make architectural iteration prohibitively expensive. Any time you change a pattern here or there you have to propagate that change to a dozen other files. The generator automates that part. So it's useful internally to this repo, but not all that great for the applications forked off from it.

## About this architecture

This is a fairly model-driven architecture. What that means is that a lot of things are built in patterns that flow from data model definitions (e.g. having a UI page for each kind of entity, or defining display-name behavior on an entity definition instead of in UI widgets). Although the models don't actually have all that much depth themselves, the bulk of the code throughout the rest of the app is still built in model-driven patterns. Think of it as [a bunch of macroexpansions](https://twitter.com/paulg/status/1507674754760773637), because [it is](#recommended-usage-of-the-generator).

> **_Note:_** I linked to Paul Graham's take because I think it's very interesting. Here's what I have to say about it: first, to some extent he's right, and the verbosity or WETness (as opposed to DRYness) of this repo is just an artifact of it not being done yet (and it's better to err on the side of vetting out your pattern for too long before formalizing it in an abstraction, rather than on the side of premature/bad abstractions). Second, the appearance of WETness is kind of misleading; it only looks that way because this repo &mdash; by the nature of its purpose &mdash; doesn't have any of the business logic that would eventually make each page or service or other component unique.

The concept of a "model-driven" application goes way back and is at the root of a lot of the ways we talk about architecture and OOP. There are endless frameworks, conceptual models, and management techniques dedicated to it, and it might be very interesting to explore some of them.

- [**Domain Driven Design:**](https://en.wikipedia.org/wiki/Domain-driven_design) this is a concept that encompasses both project management and technical architecture, and it happens to be used by Ed-Fi.
- [**Naked Objects:**](https://github.com/NakedObjectsGroup/NakedObjectsFramework) this is a highly-declarative, model-driven, rapid-development framework in .NET capable of generating an entire full-stack application from a data model.
- [**Model-driven PowerApps:**](https://make.powerapps.com/environments/Default-bc345061-7e09-46d5-8df7-0a3a4df73504/home) this is one of the innumerable GUI-based enterprise app builders that exist. It's part of our O365 subscription if you want to try it out.
- [**Directus:**](https://directus.io/blog/backend-as-a-service-the-what-why-and-how/) this is another one of the innumerable products in the general space of declarative back-ends.

As an example of a model-driven pattern in this repo, all entities have a getter called `displayName`. In the parent class this just returns a string of the entity's ID, but the intent is for each business entity to override this getter with something more appropriate. In the case of `User`, for example, this is a concatenation of the first and last name separated by a space. The "built-in" part is that throughout the app, UI widgets just show the `displayName` without any knowledge of what it is. So the definition of "display-name behavior" is built into the data model, with no need for any other component of the application to know or care. You could change that definition in the model, and the whole app would update.

For an example of one of the "de facto macroexpansions", see the `{EntityName}Link` components in the front-end. They all basically look the same, but they use the routes and queries specific to their entity. In theory you could create some global register of all the entities and routes on the front end and make a single "factory" to avoid the boilerplate of having basically the same component repeated many times, but for now the judgement call is that that would be just one more piece of spaghetti to understand. So, it's up to you to either stick to the pattern or not. As another example of a convention, suppose you need to work with some piece of data that's a transformation of several other entities. Maybe you should do it by creating a TypeORM `ViewEntity`, and then writing most of the services, controllers, UI pages, etc. just the same as you would if it were a plain `Entity`. The alternative would be do do some transformations in TS either in the front-end or back-end, and organize the logic in some other way. It's up to you, but the point is you _could_ do it in the model-driven way for the sake of convention if for no other reason (if there are good reasons to do it a different way, then please do it a different way).

One problem when trying to make a "standard" architecture is that it's easy to get carried away and abstract things too much, in ways that are too inelegent, and end up with something that's DRY but not in a good way. The difficulty of getting it right is really the problem that the generator mentioned above addresses. It makes it much easier to spin up a pretty substantial application, zoom out as a user and developer, and think about what the _right_ abstractions are.
