import {
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
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionSerializer, RegisterOidcIdpsService],
  exports: [AuthService],
})
export class AuthModule {}
