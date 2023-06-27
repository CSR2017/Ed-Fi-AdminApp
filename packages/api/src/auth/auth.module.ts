import {
  AppLauncher,
  Edorg,
  Ods,
  Oidc,
  Ownership,
  Sbe,
  Tenant,
  User,
  UserTenantMembership,
} from '@edanalytics/models-server';
import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../tenants/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionSerializer } from './helpers/session.serializer';
import { IdpService } from './idp.service';
import { RegisterAlIdpsService } from './login/applauncher.strategy';
import { LocalStrategy } from './login/local.strategy';
import { RegisterOidcIdpsService } from './login/oidc.strategy';

@Global()
@Module({
  imports: [
    UsersModule,
    PassportModule.register({ session: true }),
    TypeOrmModule.forFeature([
      User,
      Sbe,
      Ods,
      Edorg,
      Ownership,
      UserTenantMembership,
      Tenant,
      Oidc,
      AppLauncher,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    IdpService,
    LocalStrategy,
    SessionSerializer,
    RegisterOidcIdpsService,
    RegisterAlIdpsService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
