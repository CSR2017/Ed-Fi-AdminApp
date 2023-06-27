import {
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PassportStrategy } from '@nestjs/passport';
import config from 'config';
import {
  Client,
  Issuer,
  Strategy,
  TokenSet,
  UserinfoResponse,
} from 'openid-client';
import { AuthService } from '../auth.service';
import { IdpService } from '../idp.service';
import { Oidc, AppLauncher } from '@edanalytics/models-server';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import passport from 'passport';

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
              if (typeof userinfo.email !== 'string' || userinfo.email === '') {
                throw new Error('Invalid email from IdP');
              }
              const user = await this.authService.findOrCreateUser({
                username: userinfo.email,
                givenName: userinfo.given_name,
                familyName: userinfo.family_name,
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
