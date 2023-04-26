// packages/api/src/environments/environment.local.ts

export const environment = {
  production: false,
  OAUTH2_CLIENT_PROVIDER_OIDC_ISSUER: 'http://localhost:8080/realms/example',
  OAUTH2_CLIENT_REGISTRATION_LOGIN_CLIENT_ID: 'oidc-client-one',
  OAUTH2_CLIENT_REGISTRATION_LOGIN_CLIENT_SECRET: 'VWha3PqvJrDEcd53XHfQeE8WbKZbacvg',
  OAUTH2_CLIENT_REGISTRATION_LOGIN_REDIRECT_URI: 'http://localhost:3333/api/auth/oidc/callback',
  OAUTH2_CLIENT_REGISTRATION_LOGIN_SCOPE: '',
};
