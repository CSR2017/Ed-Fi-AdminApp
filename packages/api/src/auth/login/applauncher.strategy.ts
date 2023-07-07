import { AppLauncher } from '@edanalytics/models-server';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model';
import { Request } from 'express';
import passport from 'passport';
import { Strategy } from 'passport-custom';
import { Repository } from 'typeorm';
import { AuthService } from '../auth.service';

@Injectable()
export class RegisterAlIdpsService {
  constructor(
    @InjectRepository(AppLauncher)
    private alRepo: Repository<AppLauncher>,
    @Inject(AuthService)
    private authService: AuthService
  ) {
    alRepo.find().then((applaunchers) => {
      applaunchers.forEach(async (alConfig) => {
        const verifier = CognitoJwtVerifier.create({
          userPoolId: alConfig.poolId,
          tokenUse: 'access',
          clientId: alConfig.clientId,
        });
        const strategy = new Strategy(async (req: Request, done) => {
          try {
            let decodedAuthResult: { token: string; email: string };
            try {
              decodedAuthResult = JSON.parse(
                Buffer.from(req.params.authResult, 'base64url').toString()
              );
            } catch (unusableCallbackData) {
              Logger.warn('Unusable data in applauncher callback');
              throw unusableCallbackData;
            }
            let payload: CognitoAccessTokenPayload;
            try {
              payload = await verifier.verify(decodedAuthResult.token);
            } catch (invalidToken) {
              Logger.warn('Invalid applauncher cognito token');
              throw invalidToken;
            }

            const user = await this.authService.findOrCreateUser({
              username: payload.username,
            });
            return done(null, user);
          } catch (err) {
            return done(null, false);
          }
        });
        passport.use(`al-${alConfig.id}`, strategy);
      });
    });
  }
}
