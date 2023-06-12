import { Edorg, Ods, Ownership } from '@edanalytics/models-server';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnershipsService } from '../tenants/ownerships/ownerships.service';
import { OwnershipsGlobalController } from './ownerships-global.controller';
import { OwnershipsGlobalService } from './ownerships-global.service';

@Module({
  imports: [TypeOrmModule.forFeature([Edorg, Ods, Ownership, Ownership])],
  controllers: [OwnershipsGlobalController],
  providers: [OwnershipsGlobalService],
})
export class OwnershipsGlobalModule {}
