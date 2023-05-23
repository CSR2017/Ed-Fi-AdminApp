import { toGetOwnershipDto } from '@edanalytics/models';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OwnershipsService } from './ownerships.service';
import { Authorize } from '../../auth/authorization';

@ApiTags('Ownership')
@Controller()
export class OwnershipsController {
  constructor(private readonly ownershipService: OwnershipsService) {}

  @Get()
  @Authorize({
    privilege: 'tenant.ownership:read',
    subject: {
      id: '__filtered__',
      tenantId: 'tenantId',
    },
  })
  async findAll(@Param('tenantId', new ParseIntPipe()) tenantId: number) {
    return toGetOwnershipDto(await this.ownershipService.findAll(tenantId));
  }

  @Get(':ownershipId')
  @Authorize({
    privilege: 'tenant.ownership:read',
    subject: {
      id: 'ownershipId',
      tenantId: 'tenantId',
    },
  })
  async findOne(
    @Param('ownershipId', new ParseIntPipe()) ownershipId: number,
    @Param('tenantId', new ParseIntPipe()) tenantId: number
  ) {
    return toGetOwnershipDto(
      await this.ownershipService.findOne(tenantId, +ownershipId)
    );
  }
}
