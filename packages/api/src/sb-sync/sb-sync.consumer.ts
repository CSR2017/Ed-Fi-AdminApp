import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import PgBoss from 'pg-boss';
import config from 'config';
import { Sbe } from '@edanalytics/models-server';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SbesGlobalService } from '../sbes-global/sbes-global.service';
import { PgBossInstance, SYNC_CHNL, SYNC_SCHEDULER_CHNL } from './sb-sync.module';

@Injectable()
export class SbSyncConsumer implements OnModuleInit {
  constructor(
    @InjectRepository(Sbe)
    private sbesRepository: Repository<Sbe>,
    private readonly sbeService: SbesGlobalService,
    @Inject('PgBossInstance')
    private readonly boss: PgBossInstance
  ) {}

  public async onModuleInit() {
    this.boss.on('error', (error) => Logger.error(error));

    await this.boss.schedule(SYNC_SCHEDULER_CHNL, config.SB_SYNC_CRON, null, {
      tz: 'America/Chicago',
    });

    await this.boss.work(SYNC_SCHEDULER_CHNL, async () => {
      const sbes = await this.getEligibleSbes();
      Logger.log(`Starting sync for ${sbes.length} environments.`);
      await Promise.all(
        sbes.map((sbe) =>
          this.boss.send(
            SYNC_CHNL,
            { sbeId: sbe.id },
            { singletonKey: String(sbe.id), expireInHours: 1 }
          )
        )
      );
    });

    await this.boss.work(SYNC_CHNL, async (job: PgBoss.Job<{ sbeId: number }>) => {
      return this.sbeService.refreshResources(job.data.sbeId, undefined);
    });
  }

  public async getEligibleSbes() {
    return this.sbesRepository.find();
  }
}
