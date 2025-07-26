# Ed-Fi Developer's Guide

First, read the [SBAA Developer's Guide](./development.md) - but ignore anything about AWS. Take that as the appropriate starting point. Where typical Ed-Fi practices have differed from the SBAA practices, the Alliance will try to adapt to the "SBAA way" for consistency with the existing source code.

## Creating Releases

Two differences to highlight:

- `main` is only used for releases. Daily work goes into `develop` as the default branch, which is merged into `main` when a release is made.
  - Thus `main` always has the last release in it, making it easy to patch that release if needed when `develop` is not ready for public use.
- PR naming convention: add an appropriate prefix _before_ a Jira ticket number. Example: "feature: AC-264 feature flag for non-SBE deployments".

## Running Locally

See [compose/readme.md](../compose/readme.md).

## File Headers

This repository does not use file headers, as found in other Ed-Fi repositories.

## Linting

`npm run prettier:check` and `npm run prettier:write` can find and fix a lot of format errors. And these commands can take a long time to run, since they scan every file in the repository.

It is also easy to test / fix a specific file, for example:

```shell
npx prettier compose/readme.md
npx pretteri --write compose/readmem.d
```

## Troubleshooting

### The Nx Daemon is unsupported in WebAssembly environments

The error message `The Nx Daemon is unsupported in WebAssembly environments` seems to occur when the package-lock.json has an OS-dependent version of some library. For example, it might be installing a Linux or MacOS binary, and you need Windows. Try obliterating local copy of all node files and reinstalling.

```shell
rm -r node_modules package-lock.json .nx
npm cache clear --force
npm install
```

### ERESOLVE unable to resolve dependency tree

There is some deep peer dependency problem that results in an error like this:

```none
npm error code ERESOLVE
npm error ERESOLVE unable to resolve dependency tree
npm error
npm error While resolving: ts-app-base-se@2.0.1
npm error Found: @storybook/components@8.6.14
npm error node_modules/@storybook/components
npm error   dev @storybook/components@"8.6.14" from the root project
npm error
npm error Could not resolve dependency:
npm error peer @storybook/components@"^7.0.0" from storybook-addon-react-router-v6@2.0.15
npm error node_modules/storybook-addon-react-router-v6
npm error   dev storybook-addon-react-router-v6@"^2.0.4" from the root project
npm error
npm error Fix the upstream dependency conflict, or retry
npm error this command with --force or --legacy-peer-deps
npm error to accept an incorrect (and potentially broken) dependency resolution.
```

Although it is not ideal, go ahead and run:

```shell
npm install --legacy-peer-deps
```
