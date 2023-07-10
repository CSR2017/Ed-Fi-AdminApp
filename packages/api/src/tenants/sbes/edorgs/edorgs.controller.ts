import { Ids, toGetEdorgDto } from '@edanalytics/models';
import { Edorg } from '@edanalytics/models-server';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Authorize } from '../../../auth/authorization';
import { InjectFilter } from '../../../auth/helpers/inject-filter';
import { whereIds } from '../../../auth/helpers/where-ids';
import { EdorgsService } from './edorgs.service';

@ApiTags('Edorg')
@Controller()
export class EdorgsController {
  constructor(
    private readonly edorgService: EdorgsService,
    @InjectRepository(Edorg)
    private edorgsRepository: Repository<Edorg>
  ) {}

  @Get()
  @Authorize({
    privilege: 'tenant.sbe.edorg:read',
    subject: {
      id: '__filtered__',
      sbeId: 'sbeId',
      tenantId: 'tenantId',
    },
  })
  async findAll(
    @Param('tenantId', new ParseIntPipe()) tenantId: number,
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @InjectFilter('tenant.sbe.edorg:read') validIds: Ids
  ) {
    return toGetEdorgDto(await this.edorgsRepository.findBy({ ...whereIds(validIds), sbeId }));
  }

  @Get(':edorgId')
  @Authorize({
    privilege: 'tenant.sbe.edorg:read',
    subject: {
      id: 'edorgId',
      sbeId: 'sbeId',
      tenantId: 'tenantId',
    },
  })
  async findOne(
    @Param('edorgId', new ParseIntPipe()) edorgId: number,
    @Param('tenantId', new ParseIntPipe()) tenantId: number,
    @Param('sbeId', new ParseIntPipe()) sbeId: number
  ) {
    return toGetEdorgDto(await this.edorgService.findOne(edorgId));
  }
}
