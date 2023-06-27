import { toGetUserDto } from '@edanalytics/models';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Authorize } from '../../auth/authorization';
import { UsersService } from './users.service';

@ApiTags('User')
@Controller()
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Authorize({
    privilege: 'tenant.user:read',
    subject: {
      id: '__filtered__',
      tenantId: 'tenantId',
    },
  })
  @Get()
  async findAll(@Param('tenantId', new ParseIntPipe()) tenantId: number) {
    return toGetUserDto(await this.userService.findAll(tenantId));
  }

  @Get(':userId')
  @Authorize({
    privilege: 'tenant.user:read',
    subject: {
      id: 'userId',
      tenantId: 'tenantId',
    },
  })
  async findOne(
    @Param('userId', new ParseIntPipe()) userId: number,
    @Param('tenantId', new ParseIntPipe()) tenantId: number
  ) {
    return toGetUserDto(await this.userService.findOne(tenantId, +userId));
  }
}
