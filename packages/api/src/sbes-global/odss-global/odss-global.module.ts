import { Module } from '@nestjs/common';
import { OdssGlobalService } from './odss-global.service';
import { OdssGlobalController } from './odss-global.controller';
import { Ods } from '@edanalytics/models-server';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Ods])],
  controllers: [OdssGlobalController],
  providers: [OdssGlobalService],
})
export class OdssGlobalModule {}
