# Testing Environment

For consistency in test execution, functional and performance tests will use
services running as Docker containers. Useability tests can run in Docker.
Ideally the operational useability tests will also run other configurations,
described below.

## Deployment Diagram

> [!TIP]
> The testing environment is not yet well defined; it will be updated later. TBD

## Test Run Location

Functional testing can run on any environment: developer desktop, VM, GitHub
runner. Performance testing should run in a cloud environment rather than on a
developer desktop for optimal consistency between test runs.
