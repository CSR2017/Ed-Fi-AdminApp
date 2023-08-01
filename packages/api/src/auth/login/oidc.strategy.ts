import { AppLauncher, Oidc } from '@edanalytics/models-server';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import config from 'config';
import { Issuer, Strategy, TokenSet } from 'openid-client';
import passport from 'passport';
import { Repository } from 'typeorm';
import { AuthService } from '../auth.service';

@Injectable()
export class RegisterOidcIdpsService {
  constructor(
    @InjectRepository(Oidc)
    private oidcRepo: Repository<Oidc>,
    @InjectRepository(AppLauncher)
    private alRepo: Repository<AppLauncher>,
    @Inject(AuthService)
    private authService: AuthService
  ) {
    oidcRepo.find().then((oidcs) => {
      oidcs.forEach(async (oidcConfig) => {
        const TrustIssuer = await Issuer.discover(
          `${oidcConfig.issuer}/.well-known/openid-configuration`
        );
        const client = new TrustIssuer.Client({
          client_id: oidcConfig.clientId,
          client_secret: oidcConfig.clientSecret,
        });
        const strategy = new Strategy(
          {
            client,
            params: {
              redirect_uri: `${config.MY_URL}/api/auth/oidc/${oidcConfig.id}/callback`,
              scope: oidcConfig.scope,
            },
            usePKCE: false,
          },
          async (tokenset: TokenSet, userinfo, done) => {
            try {
              let username: string | undefined = undefined;
              if (typeof userinfo.email !== 'string' || userinfo.email === '') {
                throw new Error('Invalid email from IdP');
              } else {
                username = userinfo.email;
              }
              const user = await this.authService.findOrCreateUser({
                username: username,
                givenName: userinfo.given_name === '' ? null : userinfo.given_name,
                familyName: userinfo.family_name === '' ? null : userinfo.family_name,
              });
              return done(null, user);
            } catch (err) {
              return done(null, false);
            }
          }
        );
        passport.use(`oidc-${oidcConfig.id}`, strategy);
      });
    });
  }
}
