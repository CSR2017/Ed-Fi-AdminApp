import { Edorg, Ods, User } from '@edanalytics/models-server';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersGlobalController } from './users-global.controller';
import { UsersGlobalService } from './users-global.service';

@Module({
  imports: [TypeOrmModule.forFeature([Edorg, Ods, User, User])],
  controllers: [UsersGlobalController],
  providers: [UsersGlobalService],
})
export class UsersGlobalModule {}
