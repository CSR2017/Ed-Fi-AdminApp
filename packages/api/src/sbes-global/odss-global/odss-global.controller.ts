import { toGetOdsDto } from '@edanalytics/models';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Authorize } from '../../auth/authorization';
import { OdssGlobalService } from './odss-global.service';

@ApiTags('Global - Ods')
@Controller()
export class OdssGlobalController {
  constructor(private readonly odsService: OdssGlobalService) {}

  @Get()
  @Authorize({
    privilege: 'ods:read',
    subject: {
      id: '__filtered__',
    },
  })
  async findAll(@Param('sbeId', new ParseIntPipe()) sbeId: number) {
    return toGetOdsDto(await this.odsService.findAll(sbeId));
  }

  @Get(':odsId')
  @Authorize({
    privilege: 'ods:read',
    subject: {
      id: 'odsId',
    },
  })
  async findOne(
    @Param('odsId', new ParseIntPipe()) odsId: number,
    @Param('sbeId', new ParseIntPipe()) sbeId: number
  ) {
    return toGetOdsDto(await this.odsService.findOne(sbeId, +odsId));
  }
}
