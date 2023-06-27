import { Ids, toGetOdsDto } from '@edanalytics/models';
import { Ods } from '@edanalytics/models-server';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Authorize } from '../../../auth/authorization';
import { InjectFilter } from '../../../auth/helpers/inject-filter';
import { whereIds } from '../../../auth/helpers/where-ids';
import { OdssService } from './odss.service';

@ApiTags('Ods')
@Controller()
export class OdssController {
  constructor(
    private readonly odsService: OdssService,
    @InjectRepository(Ods)
    private odssRepository: Repository<Ods>
  ) {}

  @Get()
  @Authorize({
    privilege: 'tenant.sbe.ods:read',
    subject: {
      id: '__filtered__',
      sbeId: 'sbeId',
      tenantId: 'tenantId',
    },
  })
  async findAll(
    @Param('tenantId', new ParseIntPipe()) tenantId: number,
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @InjectFilter('tenant.sbe.ods:read') validIds: Ids
  ) {
    return toGetOdsDto(
      await this.odssRepository.findBy({
        ...whereIds(validIds),
        sbeId,
      })
    );
  }

  @Get(':odsId')
  @Authorize({
    privilege: 'tenant.sbe.ods:read',
    subject: {
      id: 'odsId',
      sbeId: 'sbeId',
      tenantId: 'tenantId',
    },
  })
  async findOne(
    @Param('odsId', new ParseIntPipe()) odsId: number,
    @Param('tenantId', new ParseIntPipe()) tenantId: number,
    @Param('sbeId', new ParseIntPipe()) sbeId: number
  ) {
    return toGetOdsDto(await this.odsService.findOne(odsId));
  }
}
