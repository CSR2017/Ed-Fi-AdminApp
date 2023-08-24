import { toOperationResultDto, toSbSyncQueueDto } from '@edanalytics/models';
import { SbSyncQueue } from '@edanalytics/models-server';
import { Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Authorize } from '../auth/authorization';
import { PgBossInstance, SYNC_SCHEDULER_CHNL } from './sb-sync.module';
import { StatusType } from '@edanalytics/utils';

@ApiTags('SB Sync Queue')
@Controller()
export class SbSyncController {
  constructor(
    @Inject('PgBossInstance')
    private readonly boss: PgBossInstance,
    @InjectRepository(SbSyncQueue) private readonly queueRepository: Repository<SbSyncQueue>
  ) {}

  @Get()
  @Authorize({
    privilege: 'sb-sync-queue:read',
    subject: {
      id: '__filtered__',
    },
  })
  async findAll() {
    return toSbSyncQueueDto(await this.queueRepository.find());
  }

  @Get(':sbSyncQueueId')
  @Authorize({
    privilege: 'sb-sync-queue:read',
    subject: {
      id: '__filtered__',
    },
  })
  async findOne(@Param('sbSyncQueueId') sbSyncQueueId: string) {
    return toSbSyncQueueDto(await this.queueRepository.findOneBy({ id: sbSyncQueueId }));
  }

  @Post()
  @Authorize({
    privilege: 'sbe:refresh-resources',
    subject: {
      id: '__filtered__',
    },
  })
  async triggerSync() {
    await this.boss.send({ name: SYNC_SCHEDULER_CHNL });
    return toOperationResultDto({
      status: StatusType.success,
      title: 'Sync queued',
    });
  }
}
