# Gateway

aka: NestJS Gateway, Gateway Service

## Quickstart

We can run the gateway in isolation with the docker compose in this directory
or as part of the complete backend stack. See master
[README](https://github.com/kiva/protocol/blob/master/README.md) for details.

## Dependencies

Dependencies are components which are required to build and run the service
locally and in production. Dependencies include language, libraries, other
services, data, config, environment, platform.

### Language / Libraries:

- NestJS
- http-proxy-middleware: this is what the gateway uses to proxy requests to mapped microservice routes
- See `package.json` in this directory for the full list of library dependencies

### Service

[Note: Gateway will run without any other services (TODO: confirm this) but
will only be able to service ping healthchecks]

- Wallet Sync Service (plaintext HTTP, no authentication required, internal to VPC)

### Data

Gateway is stateless (no database)

### Env / Config

Locally (and in CICD) the service uses the .env config file in this directory
which is populated from the dotEnvFiles.contents in the top level of the
protocol repo. It uses that .env file to specify which environment the service
is running in and then uses that information to pull config from
`src/config/env.json` in this directory.

In deployed environments the service uses the kubernetes secrets file to set
the environment which then determines which section of the config json the
service reads (from the `src/config/env.json` in this directory).

## Ownership

Development: @jsaur

Operations: @jsaur

## Features / Aspects

The gateway routes requests coming from the ingress to the specific internal
services required. It also authenticates and authorizes requests via Auth0. It
also generates a request ID to attach to the request sent onward if that isn't
provided by the request.

- All routes are defined in gateway.routes.ts (and documented with Swagger).
- Routes are protected by AuthenticationMiddleware which calls the auth0 service to verify the Authorization header.
- Traced by opentracing.
- Logs to stdout/stderr in human readable and JSON format.
- Rate limiting
- CORS whitelisting
- Standard vulnerability protections (via helmet)

## Known Bugs / Quirks

None
