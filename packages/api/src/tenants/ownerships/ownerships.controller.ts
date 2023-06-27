import { toGetOwnershipDto } from '@edanalytics/models';
import { Ownership } from '@edanalytics/models-server';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Authorize } from '../../auth/authorization';
import { throwNotFound } from '../../utils';

@ApiTags('Ownership')
@Controller()
export class OwnershipsController {
  constructor(
    @InjectRepository(Ownership)
    private ownershipsRepository: Repository<Ownership>
  ) {}

  @Get()
  @Authorize({
    privilege: 'tenant.ownership:read',
    subject: {
      id: '__filtered__',
      tenantId: 'tenantId',
    },
  })
  async findAll(@Param('tenantId', new ParseIntPipe()) tenantId: number) {
    return toGetOwnershipDto(
      await this.ownershipsRepository.findBy({ tenantId })
    );
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
      await this.ownershipsRepository
        .findOneByOrFail({ tenantId, id: ownershipId })
        .catch(throwNotFound)
    );
  }
}
