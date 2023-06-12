import { Edorg, Ods, UserTenantMembership } from '@edanalytics/models-server';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTenantMembershipsGlobalController } from './user-tenant-memberships-global.controller';
import { UserTenantMembershipsGlobalService } from './user-tenant-memberships-global.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Edorg,
      Ods,
      UserTenantMembership,
      UserTenantMembership,
    ]),
  ],
  controllers: [UserTenantMembershipsGlobalController],
  providers: [UserTenantMembershipsGlobalService],
})
export class UserTenantMembershipsGlobalModule {}
