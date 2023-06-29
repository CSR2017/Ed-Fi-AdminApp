import {
  GetSessionDataDto,
  PostSbeDto,
  PutSbeAdminApi,
  PutSbeAdminApiRegister,
  PutSbeMeta,
  toGetSbeDto,
  toOperationResultDto,
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
import { StartingBlocksService } from '../tenants/sbes/starting-blocks/starting-blocks.service';
import { throwNotFound } from '../utils';
import { SbesGlobalService } from './sbes-global.service';

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
    return toGetSbeDto(
      await this.sbeService.findOne(sbeId).catch(throwNotFound)
    );
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
    return toOperationResultDto(
      await this.sbeService.refreshResources(sbeId, user)
    );
  }

  @Put(':sbeId/check-connection')
  @Authorize({
    privilege: 'sbe:read',
    subject: {
      id: '__filtered__',
    },
  })
  async checkConnections(@Param('sbeId', new ParseIntPipe()) sbeId: number) {
    return toOperationResultDto({
      id: sbeId,
      ...(await this.sbeService.checkConnections(sbeId)),
    });
  }

  @Put(':sbeId/admin-api')
  @Authorize({
    privilege: 'sbe:update',
    subject: {
      id: '__filtered__',
    },
  })
  async updateAdminApi(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @Body() updateDto: PutSbeAdminApi,
    @ReqUser() user: GetSessionDataDto
  ) {
    return toGetSbeDto(
      await this.sbeService.updateAdminApi(
        sbeId,
        addUserModifying(updateDto, user)
      )
    );
  }
  @Put(':sbeId/sbe-meta')
  @Authorize({
    privilege: 'sbe:update',
    subject: {
      id: '__filtered__',
    },
  })
  async updateSbMeta(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @Body() updateDto: PutSbeMeta,
    @ReqUser() user: GetSessionDataDto
  ) {
    return toGetSbeDto(
      await this.sbeService.updateSbMeta(
        sbeId,
        addUserModifying(updateDto, user)
      )
    );
  }

  @Put(':sbeId/register-admin-api')
  @Authorize({
    privilege: 'sbe:update',
    subject: {
      id: '__filtered__',
    },
  })
  async registerAdminApi(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @Body() updateDto: PutSbeAdminApiRegister,
    @ReqUser() user: GetSessionDataDto
  ) {
    return toGetSbeDto(
      await this.sbeService.selfRegisterAdminApi(
        sbeId,
        addUserModifying(updateDto, user)
      )
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
