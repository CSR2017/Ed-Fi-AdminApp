import {
  GetUserDto,
  ISbEnvironmentConfigPublicV1,
  PostSbEnvironmentDto,
  PutEdfiTenantAdminApi,
  PutEdfiTenantAdminApiRegister,
  PutSbEnvironmentDto,
  PutSbEnvironmentMeta,
} from '@edanalytics/models';
import { SbEnvironment } from '@edanalytics/models-server';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminApiServiceV1 } from '../teams/edfi-tenants/starting-blocks/v1/admin-api.v1.service';
import { throwNotFound } from '../utils';

@Injectable()
export class SbEnvironmentsGlobalService {
  constructor(
    @InjectRepository(SbEnvironment)
    private sbEnvironmentsRepository: Repository<SbEnvironment>,
    private readonly adminApiServiceV1: AdminApiServiceV1
  ) {}
  create(createSbEnvironmentDto: PostSbEnvironmentDto) {
    return this.sbEnvironmentsRepository.save(
      this.sbEnvironmentsRepository.create(createSbEnvironmentDto)
    );
  }

  async findOne(id: number) {
    return this.sbEnvironmentsRepository.findOneByOrFail({ id });
  }

  async update(id: number, updateSbEnvironmentDto: PutSbEnvironmentDto) {
    const old = await this.findOne(id);
    return this.sbEnvironmentsRepository.save({
      ...old,
      ...updateSbEnvironmentDto,
    });
  }

  async remove(id: number, user: GetUserDto) {
    const old = await this.findOne(id).catch(throwNotFound);
    await this.sbEnvironmentsRepository.remove(old);
    return undefined;
  }

  async updateAdminApi(id: number, updateDto: PutEdfiTenantAdminApi) {
    const old = await this.findOne(id);
    const adminApiUrl = new URL(
      (old.configPublic.values as ISbEnvironmentConfigPublicV1).adminApiUrl
    );
    adminApiUrl.hostname = 'adminapi.' + adminApiUrl.hostname;
    await this.sbEnvironmentsRepository.save({
      ...old,
      modifiedById: updateDto.modifiedById,
      configPublic: {
        ...old.configPublic,
        adminApiKey: updateDto.adminKey,
        adminApiUrl: adminApiUrl.toString(),
      },
      configPrivate: {
        ...old.configPrivate,
        adminApiSecret: updateDto.adminSecret,
      },
    });
    return await this.sbEnvironmentsRepository.findOneBy({ id });
  }

  async updateSbMeta(id: number, updateDto: PutSbEnvironmentMeta) {
    const old = await this.findOne(id);
    return await this.sbEnvironmentsRepository.save({
      ...old,
      modifiedById: updateDto.modifiedById,
      configPublic: {
        ...old.configPublic,
        sbEnvironmentMetaArn: updateDto.arn,
      },
    });
  }

  async selfRegisterAdminApi(
    sbEnvironment: SbEnvironment,
    updateDto: PutEdfiTenantAdminApiRegister
  ) {
    const registrationResult = await this.adminApiServiceV1.selfRegisterAdminApi(
      updateDto.adminRegisterUrl
    );

    if (registrationResult.status === 'SUCCESS') {
      const { credentials } = registrationResult;
      await this.sbEnvironmentsRepository.save({
        ...sbEnvironment,
        modifiedById: updateDto.modifiedById,
        configPublic: {
          ...sbEnvironment.configPublic,
          adminApiKey: credentials.ClientId,
          adminApiUrl: updateDto.adminRegisterUrl,
          adminApiClientDisplayName: credentials.DisplayName,
        },
        configPrivate: {
          ...sbEnvironment.configPrivate,
          adminApiSecret: credentials.ClientSecret,
        },
      });
      return {
        status: registrationResult.status,
        result: await this.sbEnvironmentsRepository.findOneBy({ id: sbEnvironment.id }),
      };
    } else {
      return registrationResult;
    }
  }
}
