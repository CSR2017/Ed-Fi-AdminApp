import { Ids, toGetSbeDto } from '@edanalytics/models';
import { Sbe } from '@edanalytics/models-server';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Authorize } from '../../auth/authorization/authorize.decorator';
import { InjectFilter } from '../../auth/helpers/inject-filter';
import { whereIds } from '../../auth/helpers/where-ids';
import { SbesService } from './sbes.service';

@ApiTags('Sbe')
@Controller()
export class SbesController {
  constructor(
    private readonly sbeService: SbesService,
    @InjectRepository(Sbe)
    private sbesRepository: Repository<Sbe>
  ) {}

  @Get()
  @Authorize({
    privilege: 'tenant.sbe:read',
    subject: {
      id: '__filtered__',
      tenantId: 'tenantId',
    },
  })
  async findAll(
    @Param('tenantId', new ParseIntPipe()) tenantId: number,
    @InjectFilter('tenant.sbe:read') validIds: Ids
  ) {
    return toGetSbeDto(await this.sbesRepository.findBy(whereIds(validIds)));
  }

  @Get(':sbeId')
  @Authorize({
    privilege: 'tenant.sbe:read',
    subject: {
      id: 'sbeId',
      tenantId: 'tenantId',
    },
  })
  async findOne(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @Param('tenantId', new ParseIntPipe()) tenantId: number
  ) {
    return toGetSbeDto(await this.sbeService.findOne(sbeId));
  }
}
