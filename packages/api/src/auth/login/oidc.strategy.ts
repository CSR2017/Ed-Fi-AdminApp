import { Oidc, User } from '@edanalytics/models-server';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import config from 'config';
import crypto from 'crypto';
import { Issuer, Strategy, TokenSet } from 'openid-client';
import passport from 'passport';
import { Repository } from 'typeorm';
import { AuthService } from '../auth.service';

@Injectable()
export class RegisterOidcIdpsService {
  constructor(
    @InjectRepository(Oidc)
    private readonly oidcRepo: Repository<Oidc>,
    @Inject(AuthService)
    private readonly authService: AuthService
  ) {
    this.oidcRepo.find().then((oidcs) => {
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
              redirect_uri: `${config.MY_URL}/api/auth/callback/${oidcConfig.id}`,
              scope: oidcConfig.scope,
            },
            usePKCE: false,
          },
          async (tokenset: TokenSet, userinfo, done) => {
            let username: string | undefined = undefined;
            if (typeof userinfo.email !== 'string' || userinfo.email === '') {
              throw new Error('Invalid email from IdP');
            } else {
              username = userinfo.email;
            }
            const user: User = await this.authService.validateUser(username).catch((err) => {
              Logger.error(err);
              return done(err, false);
            });

            if (user === null) {
              const usernameHash = crypto.createHash('sha1');
              usernameHash.update(username);
              Logger.warn(`User sha1:${usernameHash.digest('hex')} not found in database`);
              return done(new Error(USER_NOT_FOUND), false);
            } else if (user.roleId === null || user.roleId === undefined) {
              const usernameHash = crypto.createHash('sha1');
              usernameHash.update(username);
              Logger.warn(`No role assigned for User sha1:${usernameHash.digest('hex')}`);
              return done(new Error(NO_ROLE), false);
            } else {
              return done(null, user);
            }
          }
        );
        passport.use(`oidc-${oidcConfig.id}`, strategy);
      });
    });
  }
}

export const USER_NOT_FOUND = 'User not found';
export const NO_ROLE = 'No role assigned for user';
