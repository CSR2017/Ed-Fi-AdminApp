import { Edorg, Ods, Ownership, Sbe, User, UserTenantMembership } from '@edanalytics/models-server';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { OwnershipsGlobalController } from './ownerships-global.controller';
import { OwnershipsGlobalService } from './ownerships-global.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Edorg, UserTenantMembership, Ods, Ownership, Ownership, Sbe, User]),
  ],
  controllers: [OwnershipsGlobalController],
  providers: [OwnershipsGlobalService, AuthService],
})
export class OwnershipsGlobalModule {}
