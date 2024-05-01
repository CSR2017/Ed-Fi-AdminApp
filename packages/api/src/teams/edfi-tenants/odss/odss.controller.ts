import { Ids, PostOdsDto, toGetOdsDto } from '@edanalytics/models';
import { EdfiTenant, Ods, SbEnvironment } from '@edanalytics/models-server';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ReqEdfiTenant,
  ReqSbEnvironment,
  SbEnvironmentEdfiTenantInterceptor,
} from '../../../app/sb-environment-edfi-tenant.interceptor';
import { Authorize } from '../../../auth/authorization';
import { InjectFilter } from '../../../auth/helpers/inject-filter';
import { whereIds } from '../../../auth/helpers/where-ids';
import { StartingBlocksServiceV2 } from '../starting-blocks';
import { OdssService } from './odss.service';

@ApiTags('Ods')
@UseInterceptors(SbEnvironmentEdfiTenantInterceptor)
@Controller()
export class OdssController {
  constructor(
    private readonly odsService: OdssService,
    @InjectRepository(Ods)
    private odssRepository: Repository<Ods>,
    private readonly startingBlocksServiceV2: StartingBlocksServiceV2
  ) {}

  @Get()
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.ods:read',
    subject: {
      id: '__filtered__',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async findAll(
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @InjectFilter('team.sb-environment.edfi-tenant.ods:read') validIds: Ids
  ) {
    return toGetOdsDto(
      await this.odssRepository.findBy({
        ...whereIds(validIds),
        edfiTenantId,
      })
    );
  }

  @Get(':odsId')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.ods:read',
    subject: {
      id: 'odsId',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async findOne(
    @Param('odsId', new ParseIntPipe()) odsId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number
  ) {
    return toGetOdsDto(await this.odsService.findOne(odsId));
  }
  @Post()
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant:create-ods',
    subject: {
      teamId: 'teamId',
      edfiTenantId: 'edfiTenantId',
      id: '__filtered__',
    },
  })
  post(
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @ReqSbEnvironment() sbEnvironment: SbEnvironment,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @Body() dto: PostOdsDto
  ) {
    return this.odsService.create(sbEnvironment, edfiTenant, dto);
  }
  @Delete(':odsId')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant:delete-ods',
    subject: {
      // authorized by edfiTenant but still deleted by ODS's own id.
      teamId: 'teamId',
      edfiTenantId: 'edfiTenantId',
      id: 'odsId',
    },
  })
  delete(
    @Param('odsId', new ParseIntPipe()) odsId: number,
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqSbEnvironment() sbEnvironment: SbEnvironment,
    @ReqEdfiTenant() edfiTenant: EdfiTenant
  ) {
    return this.odsService.delete(sbEnvironment, edfiTenant, odsId);
  }
}
