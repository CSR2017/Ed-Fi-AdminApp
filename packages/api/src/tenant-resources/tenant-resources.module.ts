import { Module } from '@nestjs/common';
import { Edorg, Ods, Ownership, Role, Sbe, UserTenantMembership } from '@edanalytics/models';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantResourcesController } from './tenant-resources.controller';
import { TenantResourcesService } from './tenant-resources.service';
import { StartingBlocksServiceMock } from '../starting-blocks/starting-blocks.service.mock';

@Module({
  imports: [TypeOrmModule.forFeature([Sbe, Ods, Edorg, Role, UserTenantMembership, Ownership])],
  controllers: [TenantResourcesController],
  providers: [TenantResourcesService, StartingBlocksServiceMock],
})
export class TenantResourcesModule { }
