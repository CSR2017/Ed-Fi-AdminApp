import { GetSessionDataDto, PostRoleDto, PutRoleDto, toGetRoleDto } from '@edanalytics/models';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ReqUser } from '../../auth/helpers/user.decorator';
import { RolesService } from './roles.service';
import { ApiTags } from '@nestjs/swagger';
import { addUserCreating, addUserModifying } from '@edanalytics/models-server';
import { Authorize } from '../../auth/authorization';

@ApiTags('Role')
@Controller()
export class RolesController {
  constructor(private readonly roleService: RolesService) {}

  @Post()
  @Authorize({
    privilege: 'tenant.role:create',
    subject: {
      id: '__filtered__',
      tenantId: 'tenantId',
    },
  })
  async create(
    @Body() createRoleDto: PostRoleDto,
    @ReqUser() session: GetSessionDataDto,
    @Param('tenantId', new ParseIntPipe()) tenantId: number
  ) {
    return toGetRoleDto(
      await this.roleService.create(addUserCreating({ ...createRoleDto, tenantId }, session))
    );
  }

  @Get()
  @Authorize({
    privilege: 'tenant.role:read',
    subject: {
      id: '__filtered__',
      tenantId: 'tenantId',
    },
  })
  async findAll(@Param('tenantId', new ParseIntPipe()) tenantId: number) {
    return toGetRoleDto(await this.roleService.findAll(tenantId));
  }

  @Get(':roleId')
  @Authorize({
    privilege: 'tenant.role:read',
    subject: {
      id: 'roleId',
      tenantId: 'tenantId',
    },
  })
  async findOne(
    @Param('roleId', new ParseIntPipe()) roleId: number,
    @Param('tenantId', new ParseIntPipe()) tenantId: number
  ) {
    return toGetRoleDto(await this.roleService.findOne(tenantId, +roleId));
  }

  @Put(':roleId')
  @Authorize({
    privilege: 'tenant.role:update',
    subject: {
      id: 'roleId',
      tenantId: 'tenantId',
    },
  })
  async update(
    @Param('roleId', new ParseIntPipe()) roleId: number,
    @Param('tenantId', new ParseIntPipe()) tenantId: number,
    @Body() updateRoleDto: PutRoleDto,
    @ReqUser() session: GetSessionDataDto
  ) {
    return toGetRoleDto(
      await this.roleService.update(
        tenantId,
        roleId,
        addUserModifying({ ...updateRoleDto, tenantId }, session)
      )
    );
  }

  @Delete(':roleId')
  @Authorize({
    privilege: 'tenant.role:delete',
    subject: {
      id: 'roleId',
      tenantId: 'tenantId',
    },
  })
  remove(
    @Param('roleId', new ParseIntPipe()) roleId: number,
    @Param('tenantId', new ParseIntPipe()) tenantId: number,
    @ReqUser() session: GetSessionDataDto
  ) {
    return this.roleService.remove(tenantId, +roleId, session);
  }
}
