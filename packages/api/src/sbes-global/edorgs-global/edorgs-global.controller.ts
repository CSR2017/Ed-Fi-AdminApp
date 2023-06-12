import { toGetEdorgDto } from '@edanalytics/models';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Authorize } from '../../auth/authorization';
import { EdorgsGlobalService } from './edorgs-global.service';

@ApiTags('Global - Edorg')
@Controller()
export class EdorgsGlobalController {
  constructor(private readonly edorgService: EdorgsGlobalService) {}

  @Get()
  @Authorize({
    privilege: 'edorg:read',
    subject: {
      id: '__filtered__',
    },
  })
  async findAll(@Param('sbeId', new ParseIntPipe()) sbeId: number) {
    return toGetEdorgDto(await this.edorgService.findAll(sbeId));
  }

  @Get(':edorgId')
  @Authorize({
    privilege: 'edorg:read',
    subject: {
      id: 'edorgId',
    },
  })
  async findOne(
    @Param('edorgId', new ParseIntPipe()) edorgId: number,
    @Param('sbeId', new ParseIntPipe()) sbeId: number
  ) {
    return toGetEdorgDto(await this.edorgService.findOne(sbeId, +edorgId));
  }
}
