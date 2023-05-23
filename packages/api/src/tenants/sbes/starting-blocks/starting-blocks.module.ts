import { Edorg, Ods, Ownership, Sbe } from '@edanalytics/models-server';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StartingBlocksController } from './starting-blocks.controller';
import { StartingBlocksService } from './starting-blocks.service';
import { SbesService } from '../sbes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sbe, Ods, Edorg, Ownership])],
  controllers: [StartingBlocksController],
  providers: [StartingBlocksService, SbesService],
})
export class StartingBlocksModule {}
