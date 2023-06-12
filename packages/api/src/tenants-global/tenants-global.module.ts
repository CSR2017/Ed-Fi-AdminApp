import { Edorg, Ods, Tenant } from '@edanalytics/models-server';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsGlobalController } from './tenants-global.controller';
import { TenantsGlobalService } from './tenants-global.service';

@Module({
  imports: [TypeOrmModule.forFeature([Edorg, Ods, Tenant, Tenant])],
  controllers: [TenantsGlobalController],
  providers: [TenantsGlobalService],
})
export class TenantsGlobalModule {}
