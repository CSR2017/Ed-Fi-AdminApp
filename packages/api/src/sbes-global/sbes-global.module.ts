import { Module } from '@nestjs/common';
import { SbesGlobalService } from './sbes-global.service';
import { SbesGlobalController } from './sbes-global.controller';
import { Edorg, Ods, Ownership, Sbe } from '@edanalytics/models-server';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StartingBlocksService } from '../tenants/sbes/starting-blocks/starting-blocks.service';
import { SbesService } from '../tenants/sbes/sbes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Edorg, Ods, Sbe, Ownership])],
  controllers: [SbesGlobalController],
  providers: [SbesGlobalService, StartingBlocksService, SbesService],
})
export class SbesGlobalModule {}
