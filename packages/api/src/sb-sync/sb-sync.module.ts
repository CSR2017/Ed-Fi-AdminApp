import { Injectable, Module } from '@nestjs/common';
import { SbesGlobalModule } from '../sbes-global/sbes-global.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SbSyncQueue, Sbe } from '@edanalytics/models-server';
import { SbSyncConsumer } from './sb-sync.consumer';

import config from 'config';
import PgBoss from 'pg-boss';
import { SbSyncController } from './sb-sync.controller';

@Injectable()
export class PgBossInstance extends PgBoss {}

export const SYNC_SCHEDULER_CHNL = 'sbe-sync-scheduler';
export const SYNC_CHNL = 'sbe-sync';

@Module({
  imports: [SbesGlobalModule, TypeOrmModule.forFeature([Sbe, SbSyncQueue])],
  controllers: [SbSyncController],
  providers: [
    SbSyncConsumer,
    {
      provide: 'PgBossInstance',
      useFactory: async () => {
        const boss = new PgBossInstance({
          connectionString: await config.DB_CONNECTION_STRING,
        });
        await boss.start();
        return boss;
      },
    },
  ],
})
export class SbSyncModule {}
