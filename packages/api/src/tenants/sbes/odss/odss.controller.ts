import {
  GetSessionDataDto,
  PostOdsDto,
  PrivilegeCode,
  PutOdsDto,
  toGetOdsDto,
} from '@edanalytics/models';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ReqUser } from '../../../auth/helpers/user.decorator';
import { OdssService } from './odss.service';
import { ApiTags } from '@nestjs/swagger';
import {
  Ods,
  addUserCreating,
  addUserModifying,
} from '@edanalytics/models-server';
import { Ids } from '../../../auth/authorization/tenant-cache.interface';
import { InjectFilter } from '../../../auth/helpers/inject-filter';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { whereIds } from '../../../auth/helpers/where-ids';
import { Authorize } from '../../../auth/authorization';

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
    privilege: 'tenant.sbe.edorg:read',
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
