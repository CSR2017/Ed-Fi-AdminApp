import { Module } from '@nestjs/common';
import { EdorgsGlobalService } from './edorgs-global.service';
import { EdorgsGlobalController } from './edorgs-global.controller';
import { Edorg } from '@edanalytics/models-server';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Edorg])],
  controllers: [EdorgsGlobalController],
  providers: [EdorgsGlobalService],
})
export class EdorgsGlobalModule {}
