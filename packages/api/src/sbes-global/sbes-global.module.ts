import { Edorg, Ods, Ownership, Sbe, User, UserTenantMembership } from '@edanalytics/models-server';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { SbesService } from '../tenants/sbes/sbes.service';
import { StartingBlocksService } from '../tenants/sbes/starting-blocks/starting-blocks.service';
import { SbesGlobalController } from './sbes-global.controller';
import { SbesGlobalService } from './sbes-global.service';

@Module({
  imports: [TypeOrmModule.forFeature([Edorg, Ods, Sbe, Ownership, User, UserTenantMembership])],
  controllers: [SbesGlobalController],
  providers: [SbesGlobalService, StartingBlocksService, SbesService, AuthService],
  exports: [SbesGlobalService],
})
export class SbesGlobalModule {}
