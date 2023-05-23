import {
  GetSessionDataDto,
  PostSbeDto,
  PutSbeDto,
  toGetSbeDto,
  toSbeCCDto,
  toSbeRRDto,
} from '@edanalytics/models';
import {
  Sbe,
  addUserCreating,
  addUserModifying,
} from '@edanalytics/models-server';
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Authorize, Ids } from '../auth/authorization';
import { InjectFilter } from '../auth/helpers/inject-filter';
import { ReqUser } from '../auth/helpers/user.decorator';
import { whereIds } from '../auth/helpers/where-ids';
import { SbesGlobalService } from './sbes-global.service';
import { StartingBlocksService } from '../tenants/sbes/starting-blocks/starting-blocks.service';

@ApiTags('Sbe - Global')
@Controller()
export class SbesGlobalController {
  constructor(
    private readonly sbeService: SbesGlobalService,
    @InjectRepository(Sbe)
    private sbesRepository: Repository<Sbe>,
    private readonly sbService: StartingBlocksService
  ) {}

  @Post()
  @Authorize({
    privilege: 'sbe:create',
    subject: {
      id: '__filtered__',
    },
  })
  async create(
    @Body() createSbeDto: PostSbeDto,
    @ReqUser() user: GetSessionDataDto
  ) {
    return toGetSbeDto(
      await this.sbeService.create(addUserCreating(createSbeDto, user))
    );
  }

  @Get()
  @Authorize({
    privilege: 'sbe:read',
    subject: {
      id: '__filtered__',
    },
  })
  async findAll() {
    return toGetSbeDto(await this.sbesRepository.find());
  }

  @Get(':sbeId')
  @Authorize({
    privilege: 'sbe:read',
    subject: {
      id: '__filtered__',
    },
  })
  async findOne(@Param('sbeId', new ParseIntPipe()) sbeId: number) {
    return toGetSbeDto(await this.sbeService.findOne(sbeId));
  }

  @Put(':sbeId/refresh-resources')
  @Authorize({
    privilege: 'sbe:refresh-resources',
    subject: {
      id: '__filtered__',
    },
  })
  async refreshResources(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @ReqUser() user: GetSessionDataDto
  ) {
    return toSbeRRDto({
      id: sbeId,
      ...(await this.sbeService.refreshResources(sbeId, user)),
    });
  }

  @Put(':sbeId/check-connection')
  @Authorize({
    privilege: 'sbe:read',
    subject: {
      id: '__filtered__',
    },
  })
  async checkConnections(@Param('sbeId', new ParseIntPipe()) sbeId: number) {
    return toSbeCCDto({
      id: sbeId,
      ...(await this.sbeService.checkConnections(sbeId)),
    });
  }

  @Put(':sbeId')
  @Authorize({
    privilege: 'sbe:update',
    subject: {
      id: '__filtered__',
    },
  })
  async update(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @Body() updateSbeDto: PutSbeDto,
    @ReqUser() user: GetSessionDataDto
  ) {
    return toGetSbeDto(
      await this.sbeService.update(sbeId, addUserModifying(updateSbeDto, user))
    );
  }

  @Delete(':sbeId')
  @Authorize({
    privilege: 'sbe:delete',
    subject: {
      id: '__filtered__',
    },
  })
  remove(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @ReqUser() user: GetSessionDataDto
  ) {
    return this.sbeService.remove(sbeId, user);
  }
}
