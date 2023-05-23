import { PrivilegeCode, toGetPrivilegeDto } from '@edanalytics/models';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrivilegesService } from './privileges.service';
import { Authorize } from '../auth/authorization';

@ApiTags('Privilege')
@Controller()
export class PrivilegesController {
  constructor(private readonly privilegeService: PrivilegesService) {}

  @Get()
  @Authorize({
    privilege: 'privilege:read',
    subject: {
      id: '__filtered__',
    },
  })
  async findAll() {
    return toGetPrivilegeDto(await this.privilegeService.findAll());
  }

  @Get(':privilegeId')
  @Authorize({
    privilege: 'privilege:read',
    subject: {
      id: 'privilegeId',
    },
  })
  async findOne(@Param('privilegeId') privilegeId: string) {
    return toGetPrivilegeDto(
      await this.privilegeService.findOne(privilegeId as PrivilegeCode)
    );
  }
}
