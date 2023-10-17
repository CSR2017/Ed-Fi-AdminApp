import { GetSessionDataDto, PostRoleDto, PutRoleDto, toGetRoleDto } from '@edanalytics/models';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ReqUser } from '../../auth/helpers/user.decorator';
import { RolesService } from './roles.service';
import { ApiTags } from '@nestjs/swagger';
import { Role, addUserCreating, addUserModifying } from '@edanalytics/models-server';
import { Authorize } from '../../auth/authorization';
import { CustomHttpException, throwNotFound } from '../../utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@ApiTags('Role')
@Controller()
export class RolesController {
  constructor(
    private readonly roleService: RolesService,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>
  ) {}

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
    const result = await this.roleService.update(
      tenantId,
      roleId,
      addUserModifying({ ...updateRoleDto, tenantId }, session)
    );
    if (result.status === 'SUCCESS') {
      return toGetRoleDto(result.result);
    } else {
      if (result.status === 'INVALID_PRIVILEGES') {
        throw new CustomHttpException(
          {
            title: 'Invalid privileges',
            type: 'Error',
          },
          400
        );
      } else if (result.status === 'NOT_FOUND') {
        throw new CustomHttpException(
          {
            title: 'Not found',
            type: 'Error',
          },
          404
        );
      } else if (result.status === 'PUBLIC_ROLE') {
        throw new CustomHttpException(
          {
            title: 'Public role',
            type: 'Error',
          },
          400
        );
      } else if (result.status === 'NOT_TENANT_USER_ROLE') {
        throw new CustomHttpException(
          {
            title: 'Unknown error',
            type: 'Error',
          },
          400
        );
      }
    }
  }

  @Delete(':roleId')
  @Authorize({
    privilege: 'tenant.role:delete',
    subject: {
      id: 'roleId',
      tenantId: 'tenantId',
    },
  })
  async remove(
    @Param('roleId', new ParseIntPipe()) roleId: number,
    @Param('tenantId', new ParseIntPipe()) tenantId: number
  ) {
    const old = await this.rolesRepository.findOneBy({ tenantId, id: roleId });
    if (old === null) {
      throw new NotFoundException();
    }
    await this.rolesRepository.remove(old);
  }
}
