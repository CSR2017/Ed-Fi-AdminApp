import {
  CopyClaimsetDtoV2,
  GetApplicationDtoV2,
  GetClaimsetSingleDtoV2,
  Id,
  Ids,
  ImportClaimsetSingleDtoV2,
  PostApplicationDtoV2,
  PostApplicationFormDtoV2,
  PostClaimsetDtoV2,
  PostVendorDtoV2,
  PutApplicationDtoV2,
  PutApplicationFormDtoV2,
  PutClaimsetDtoV2,
  PutVendorDtoV2,
  edorgKeyV2,
  toApplicationYopassResponseDto,
} from '@edanalytics/models';
import { EdfiTenant, Edorg, Ods, SbEnvironment } from '@edanalytics/models-server';
import {
  BadRequestException,
  Body,
  CallHandler,
  Controller,
  Delete,
  ExecutionContext,
  Get,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NestInterceptor,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { Response } from 'express';
import NodeCache from 'node-cache';
import { In, Repository } from 'typeorm';
import {
  ReqEdfiTenant,
  ReqSbEnvironment,
  SbEnvironmentEdfiTenantInterceptor,
} from '../../../../app/sb-environment-edfi-tenant.interceptor';
import { Authorize } from '../../../../auth/authorization';
import { InjectFilter } from '../../../../auth/helpers/inject-filter';
import { checkId } from '../../../../auth/helpers/where-ids';
import {
  CustomHttpException,
  ValidationHttpException,
  isIAdminApiValidationError,
  postYopassSecret,
} from '../../../../utils';
import { AdminApiV1xExceptionFilter } from '../v1/admin-api-v1x-exception.filter';
import { AdminApiServiceV2 } from './admin-api.v2.service';

@Injectable()
class AdminApiV2Interceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const configPublic = request.sbEnvironment.configPublic;
    if (!('version' in configPublic && configPublic.version === 'v2')) {
      throw new NotFoundException(
        `Requested Admin API version not correct for this EdfiTenant. Use "${request.sbEnvironment.configPublic.adminApiVersion}" instead.`
      );
    }
    return next.handle();
  }
}

@UseFilters(new AdminApiV1xExceptionFilter())
@UseInterceptors(SbEnvironmentEdfiTenantInterceptor, AdminApiV2Interceptor)
@ApiTags('Admin API Resources - v2.x')
@Controller()
export class AdminApiControllerV2 {
  private downloadCache = new NodeCache({ stdTTL: 60 * 5 /* 5 minutes */ });
  constructor(
    private readonly sbService: AdminApiServiceV2,
    @InjectRepository(Edorg) private readonly edorgRepository: Repository<Edorg>,
    @InjectRepository(Ods) private readonly odsRepository: Repository<Ods>
  ) {}

  @Get('vendors')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.vendor:read',
    subject: {
      id: '__filtered__',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async getVendors(
    // TODO including these unused parameters is necessary for NestJS's Open API spec generation, which uses metadata configured by the parameter decorators.
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @InjectFilter('team.sb-environment.edfi-tenant.vendor:read') validIds: Ids
  ) {
    const allVendors = await this.sbService.getVendors(edfiTenant);
    return allVendors.filter((v) => checkId(v.id, validIds));
  }

  @Get('vendors/:vendorId')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.vendor:read',
    subject: {
      id: 'vendorId',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async getVendor(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @Param('vendorId', new ParseIntPipe()) vendorId: number
  ) {
    return this.sbService.getVendor(edfiTenant, vendorId);
  }

  @Put('vendors/:vendorId')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.vendor:update',
    subject: {
      id: 'vendorId',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async putVendor(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @Param('vendorId', new ParseIntPipe()) vendorId: number,
    @Body() vendor: PutVendorDtoV2
  ) {
    return this.sbService.putVendor(edfiTenant, vendorId, vendor);
  }

  @Post('vendors')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.vendor:create',
    subject: {
      id: '__filtered__',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async postVendor(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @Body() vendor: PostVendorDtoV2
  ) {
    return this.sbService.postVendor(edfiTenant, vendor);
  }

  @Delete('vendors/:vendorId')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.vendor:delete',
    subject: {
      id: 'vendorId',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async deleteVendor(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @Param('vendorId', new ParseIntPipe()) vendorId: number
  ) {
    return this.sbService.deleteVendor(edfiTenant, vendorId);
  }

  @Get('applications')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.ods.edorg.application:read',
    subject: {
      id: '__filtered__',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async getApplications(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @InjectFilter('team.sb-environment.edfi-tenant.ods.edorg.application:read')
    validIds: Ids
  ) {
    const allApplications = await this.sbService.getApplications(edfiTenant);
    return allApplications.filter((a) =>
      // It's important that we use `.some` below for safe operations, but `.every` for unsafe operations. That's the desired business logic.
      a.odsInstanceIds.some((odsInstanceId) =>
        a.educationOrganizationIds.some((educationOrganizationId) =>
          checkId(
            edorgKeyV2({
              edorg: educationOrganizationId,
              ods: odsInstanceId,
            }),
            validIds
          )
        )
      )
    );
  }

  @Get('applications/:applicationId')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.ods.edorg.application:read',
    subject: {
      id: '__filtered__',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async getApplication(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @Param('applicationId', new ParseIntPipe()) applicationId: number,
    @InjectFilter('team.sb-environment.edfi-tenant.ods.edorg.application:read')
    validIds: Ids
  ) {
    const application = await this.sbService.getApplication(edfiTenant, applicationId);

    if (
      // It's odd how Applications have array of edorgs and array of odss, but independent from each other.
      application.odsInstanceIds.some((odsInstanceId) =>
        application.educationOrganizationIds.some((edorgId) =>
          checkId(
            edorgKeyV2({
              edorg: edorgId,
              ods: odsInstanceId,
            }),
            validIds
          )
        )
      )
    ) {
      return application;
    } else {
      throw new NotFoundException();
    }
  }

  @Put('applications/:applicationId')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.ods.edorg.application:update',
    subject: {
      id: '__filtered__',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async putApplication(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @Param('applicationId', new ParseIntPipe()) applicationId: number,
    @Body() application: PutApplicationFormDtoV2,
    @InjectFilter('team.sb-environment.edfi-tenant.ods.edorg.application:update')
    validIds: Ids
  ) {
    let claimset: GetClaimsetSingleDtoV2;
    try {
      claimset = await this.sbService.getClaimset(edfiTenant, application.claimsetId);
    } catch (claimsetNotFound) {
      throw new ValidationHttpException({
        field: 'claimsetId',
        message: 'Cannot retrieve claimset for validation',
      });
    }
    if (claimset._isSystemReserved) {
      throw new ValidationHttpException({
        field: 'claimsetId',
        message: 'Cannot use system-reserved claimset',
      });
    }
    const availableEdorgs = await this.edorgRepository.findBy({
      edfiTenantId: edfiTenant.id,
      educationOrganizationId: In(application.educationOrganizationIds),
      odsInstanceId: application.odsInstanceId,
    });
    const odsInstanceId = availableEdorgs[0].odsInstanceId;

    const dto = plainToInstance(PutApplicationDtoV2, {
      ...instanceToPlain(application),
      claimSetName: claimset.name,
      odsInstanceIds: [odsInstanceId],
      educationOrganizationIds: availableEdorgs.map((edorg) => edorg.educationOrganizationId),
    });
    const existingApplication = await this.sbService.getApplication(edfiTenant, applicationId);
    if (
      !existingApplication.odsInstanceIds.every((odsInstanceId) =>
        existingApplication.educationOrganizationIds.every((educationOrganizationId) =>
          checkId(
            edorgKeyV2({
              edorg: educationOrganizationId,
              ods: odsInstanceId,
            }),
            validIds
          )
        )
      )
    ) {
      throw new HttpException('You do not have control of all implicated Ed-Orgs', 403);
    }

    if (dto.educationOrganizationIds.length !== availableEdorgs.length) {
      throw new ValidationHttpException({
        field: 'edorgIds',
        message: 'One or more invalid education organization IDs',
      });
    }
    if (
      !availableEdorgs.every((edorg) => edorg.odsInstanceId === availableEdorgs[0].odsInstanceId)
    ) {
      throw new ValidationHttpException({
        field: 'edorgIds',
        message: 'Education organizations not all from the same ODS',
      });
    }
    if (
      dto.educationOrganizationIds.every((educationOrganizationId) =>
        checkId(
          edorgKeyV2({
            edorg: educationOrganizationId,
            ods: odsInstanceId,
          }),
          validIds
        )
      )
    ) {
      return this.sbService.putApplication(edfiTenant, applicationId, dto);
    } else {
      throw new ValidationHttpException({
        field: 'edorgIds',
        message: 'Not authorized on all education organizations',
      });
    }
  }

  @Post('applications')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.ods.edorg.application:create',
    subject: {
      id: '__filtered__',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async postApplication(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @ReqSbEnvironment() sbEnvironment: SbEnvironment,
    @Query('returnRaw') returnRaw: boolean | undefined,
    @Body() application: PostApplicationFormDtoV2,
    @InjectFilter('team.sb-environment.edfi-tenant.ods.edorg.application:create')
    validIds: Ids
  ) {
    let claimset: GetClaimsetSingleDtoV2;
    try {
      claimset = await this.sbService.getClaimset(edfiTenant, application.claimsetId);
    } catch (claimsetNotFound) {
      Logger.error(claimsetNotFound);
      throw new BadRequestException('Error trying to use claimset');
    }
    if (claimset._isSystemReserved) {
      throw new ValidationHttpException({
        field: 'claimsetId',
        message: 'Cannot use system-reserved claimset',
      });
    }
    const realEdorgs = await this.edorgRepository.findBy({
      edfiTenantId: edfiTenant.id,
      educationOrganizationId: In(application.educationOrganizationIds),
      odsInstanceId: application.odsInstanceId,
    });
    if (realEdorgs.length !== application.educationOrganizationIds.length) {
      throw new ValidationHttpException({
        field: 'educationOrganizationIds',
        message: 'Invalid education organization IDs',
      });
    }
    const odsInstanceId = application.odsInstanceId;

    const dto = plainToInstance(
      PostApplicationDtoV2,
      {
        ...instanceToPlain(application),
        claimSetName: claimset.name,
        odsInstanceIds: [odsInstanceId],
      },
      { excludeExtraneousValues: true }
    );

    if (!sbEnvironment.domain)
      throw new InternalServerErrorException('Environment config lacks an Ed-Fi hostname.');
    if (
      dto.educationOrganizationIds.every((educationOrganizationId) =>
        checkId(
          edorgKeyV2({
            edorg: educationOrganizationId,
            ods: odsInstanceId,
          }),
          validIds
        )
      )
    ) {
      const adminApiResponse = await this.sbService.postApplication(edfiTenant, dto);

      const yopass = await postYopassSecret({
        ...adminApiResponse,
        url: GetApplicationDtoV2.apiUrl(
          sbEnvironment.domain,
          application.applicationName,
          edfiTenant.name
        ),
      });
      return toApplicationYopassResponseDto({
        link: yopass.link,
        applicationId: adminApiResponse.id,
      });
    } else {
      throw new ValidationHttpException({
        field: 'educationOrganizationId',
        message: 'Invalid education organization ID',
      });
    }
  }

  @Delete('applications/:applicationId')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.ods.edorg.application:delete',
    subject: {
      id: '__filtered__',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async deleteApplication(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @Param('applicationId', new ParseIntPipe()) applicationId: number,
    @InjectFilter('team.sb-environment.edfi-tenant.ods.edorg.application:delete')
    validIds: Ids
  ) {
    const application = await this.sbService.getApplication(edfiTenant, applicationId);
    const edorgsCount = await this.edorgRepository.countBy({
      edfiTenantId: edfiTenant.id,
      educationOrganizationId: In(application.educationOrganizationIds),
    });

    if (
      edorgsCount === application.educationOrganizationIds.length &&
      application.odsInstanceIds.every((odsInstanceId) =>
        application.educationOrganizationIds.every((edorgId) =>
          checkId(
            edorgKeyV2({
              edorg: edorgId,
              ods: odsInstanceId,
            }),
            validIds
          )
        )
      )
    ) {
      return this.sbService.deleteApplication(edfiTenant, applicationId);
    } else {
      throw new HttpException('You do not have control of all implicated Ed-Orgs', 403);
    }
  }

  @Put('applications/:applicationId/reset-credential')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.ods.edorg.application:reset-credentials',
    subject: {
      id: '__filtered__',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async resetApplicationCredentials(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @ReqSbEnvironment() sbEnvironment: SbEnvironment,
    @Param('applicationId', new ParseIntPipe()) applicationId: number,
    @InjectFilter('team.sb-environment.edfi-tenant.ods.edorg.application:reset-credentials')
    validIds: Ids
  ) {
    const application = await this.sbService.getApplication(edfiTenant, applicationId);
    const edorgsCount = await this.edorgRepository.countBy({
      edfiTenantId: edfiTenant.id,
      educationOrganizationId: In(application.educationOrganizationIds),
    });

    if (
      edorgsCount === application.educationOrganizationIds.length &&
      application.odsInstanceIds.every((odsInstanceId) =>
        application.educationOrganizationIds.every((edorgId) =>
          checkId(
            edorgKeyV2({
              edorg: edorgId,
              ods: odsInstanceId,
            }),
            validIds
          )
        )
      )
    ) {
      const adminApiResponse = await this.sbService.putApplicationResetCredential(
        edfiTenant,
        applicationId
      );
      const yopass = await postYopassSecret({
        ...adminApiResponse,
        url: GetApplicationDtoV2.apiUrl(
          sbEnvironment.domain,
          application.applicationName,
          edfiTenant.name
        ),
      });
      return toApplicationYopassResponseDto({
        link: yopass.link,
        applicationId: adminApiResponse.id,
      });
    } else {
      throw new HttpException('You do not have control of all implicated Ed-Orgs', 403);
    }
  }

  @Get('claimsets')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.claimset:read',
    subject: {
      id: '__filtered__',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async getClaimsets(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @InjectFilter('team.sb-environment.edfi-tenant.claimset:read')
    validIds: Ids
  ) {
    const allClaimsets = await this.sbService.getClaimsets(edfiTenant);
    return allClaimsets.filter((c) => checkId(c.id, validIds));
  }
  @Post('claimsets/export')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.claimset:read',
    subject: {
      id: '__filtered__',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async exportClaimset(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @Query('id') _ids: string[] | string
  ) {
    const ids = Array.isArray(_ids) ? _ids : [_ids];
    const claimsets = await Promise.all(
      ids.map((id) => this.sbService.exportClaimset(edfiTenant, Number(id)))
    );
    const title =
      claimsets.length === 1 ? claimsets[0].name : `${edfiTenant.sbEnvironment.envLabel} claimsets`;
    const document = {
      title,
      template: {
        claimSets: claimsets.map((c) => ({
          name: c.name,
          resourceClaims: c.resourceClaims,
        })),
      },
    };
    const id = Math.round(Math.random() * 999999999999);
    this.downloadCache.set(id, {
      content: JSON.stringify(document, null, 2),
      title: `${title.replace(/[/\\:*?"<>|]+/g, '_')}_${Number(new Date())}.json`,
    });
    return new Id(id);
  }
  @Get('claimsets/export/:exportId')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.claimset:read',
    subject: {
      id: '__filtered__',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async downloadExportClaimset(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @Param('exportId', new ParseIntPipe()) exportId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @Res() res: Response
  ) {
    const cachedItem = this.downloadCache.get<{ content: string; title: string }>(Number(exportId));
    this.downloadCache.del(Number(exportId));
    if (cachedItem === undefined) {
      throw new NotFoundException(
        'Export not found. It may have expired. We hold on to exports for 5 minutes after creation.'
      );
    } else {
      const { content, title } = cachedItem;
      res.setHeader('Content-Disposition', `attachment; filename=${title}`);
      res.setHeader('Content-Type', 'application/json');
      res.send(content);
    }
  }
  @Get('claimsets/:claimsetId')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.claimset:read',
    subject: {
      id: 'claimsetId',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async getClaimset(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @Param('claimsetId', new ParseIntPipe()) claimsetId: number
  ) {
    return this.sbService.getClaimset(edfiTenant, claimsetId);
  }

  @Put('claimsets/:claimsetId')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.claimset:update',
    subject: {
      id: 'claimsetId',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async putClaimset(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @Param('claimsetId', new ParseIntPipe()) claimsetId: number,
    @Body() claimset: PutClaimsetDtoV2
  ) {
    return await this.sbService.putClaimset(edfiTenant, claimsetId, claimset);
  }

  @Post('claimsets')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.claimset:create',
    subject: {
      id: '__filtered__',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async postClaimset(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @Body() claimset: PostClaimsetDtoV2
  ) {
    return await this.sbService.postClaimset(edfiTenant, claimset);
  }
  @Post('claimsets/copy')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.claimset:create',
    subject: {
      id: '__filtered__',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async copyClaimset(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @Body() claimset: CopyClaimsetDtoV2
  ) {
    try {
      return await this.sbService.copyClaimset(edfiTenant, claimset);
    } catch (PostError: unknown) {
      Logger.error(PostError);
      if (axios.isAxiosError(PostError)) {
        if (isIAdminApiValidationError(PostError.response?.data)) {
          if (PostError.response.data.errors?.Name?.[0]?.includes('this name already exists')) {
            throw new ValidationHttpException({
              field: 'name',
              message: 'A claimset with this name already exists. Please choose a different name.',
            });
          } else {
            throw new CustomHttpException(
              {
                title: 'Validation error',
                type: 'Error',
                data: PostError.response.data,
              },
              400
            );
          }
        }
      }
      throw PostError;
    }
  }
  @Post('claimsets/import')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.claimset:create',
    subject: {
      id: '__filtered__',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async importClaimset(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @Body() claimset: ImportClaimsetSingleDtoV2
  ) {
    return this.sbService.importClaimset(edfiTenant, claimset);
  }

  @Delete('claimsets/:claimsetId')
  @Authorize({
    privilege: 'team.sb-environment.edfi-tenant.claimset:delete',
    subject: {
      id: 'claimsetId',
      edfiTenantId: 'edfiTenantId',
      teamId: 'teamId',
    },
  })
  async deleteClaimset(
    @Param('edfiTenantId', new ParseIntPipe()) edfiTenantId: number,
    @Param('teamId', new ParseIntPipe()) teamId: number,
    @ReqEdfiTenant() edfiTenant: EdfiTenant,
    @Param('claimsetId', new ParseIntPipe()) claimsetId: number
  ) {
    await this.sbService.deleteClaimset(edfiTenant, claimsetId);
    return undefined;
  }
}
