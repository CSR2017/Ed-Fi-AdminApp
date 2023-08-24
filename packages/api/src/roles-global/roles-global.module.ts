import {
  Edorg,
  Ods,
  Ownership,
  Privilege,
  Role,
  User,
  UserTenantMembership,
} from '@edanalytics/models-server';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGlobalController } from './roles-global.controller';
import { RolesGlobalService } from './roles-global.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Edorg,
      Ods,
      User,
      Role,
      Role,
      Privilege,
      Ownership,
      UserTenantMembership,
    ]),
  ],
  controllers: [RolesGlobalController],
  providers: [RolesGlobalService],
})
export class RolesGlobalModule {}
