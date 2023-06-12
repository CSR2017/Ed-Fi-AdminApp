import {
  GetSessionDataDto,
  PostTenantDto,
  PutTenantDto,
  toGetTenantDto,
} from '@edanalytics/models';
import {
  Tenant,
  addUserCreating,
  addUserModifying,
} from '@edanalytics/models-server';
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
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Authorize } from '../auth/authorization';
import { ReqUser } from '../auth/helpers/user.decorator';
import { throwNotFound } from '../utils';
import { TenantsGlobalService } from './tenants-global.service';

@ApiTags('Tenant - Global')
@Controller()
export class TenantsGlobalController {
  constructor(
    private readonly tenantService: TenantsGlobalService,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>
  ) {}

  @Post()
  @Authorize({
    privilege: 'tenant:create',
    subject: {
      id: '__filtered__',
    },
  })
  async create(
    @Body() createTenantDto: PostTenantDto,
    @ReqUser() user: GetSessionDataDto
  ) {
    return toGetTenantDto(
      await this.tenantService.create(addUserCreating(createTenantDto, user))
    );
  }

  @Get()
  @Authorize({
    privilege: 'tenant:read',
    subject: {
      id: '__filtered__',
    },
  })
  async findAll() {
    return toGetTenantDto(await this.tenantsRepository.find());
  }

  @Get(':tenantId')
  @Authorize({
    privilege: 'tenant:read',
    subject: {
      id: '__filtered__',
    },
  })
  async findOne(@Param('tenantId', new ParseIntPipe()) tenantId: number) {
    return toGetTenantDto(
      await this.tenantService.findOne(tenantId).catch(throwNotFound)
    );
  }

  @Put(':tenantId')
  @Authorize({
    privilege: 'tenant:update',
    subject: {
      id: '__filtered__',
    },
  })
  async update(
    @Param('tenantId', new ParseIntPipe()) tenantId: number,
    @Body() updateTenantDto: PutTenantDto,
    @ReqUser() user: GetSessionDataDto
  ) {
    return toGetTenantDto(
      await this.tenantService.update(
        tenantId,
        addUserModifying(updateTenantDto, user)
      )
    );
  }

  @Delete(':tenantId')
  @Authorize({
    privilege: 'tenant:delete',
    subject: {
      id: '__filtered__',
    },
  })
  remove(
    @Param('tenantId', new ParseIntPipe()) tenantId: number,
    @ReqUser() user: GetSessionDataDto
  ) {
    return this.tenantService.remove(tenantId, user);
  }
}
