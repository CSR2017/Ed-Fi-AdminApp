import {
  GetUserDto,
  OperationResultDto,
  PostSbeDto,
  PutSbeAdminApi,
  PutSbeAdminApiRegister,
  PutSbeDto,
  PutSbeMeta,
  SbMetaEdorg,
  SbMetaOds,
  toOperationResultDto,
} from '@edanalytics/models';
import { Edorg, Ods, Sbe, addUserCreating, regarding } from '@edanalytics/models-server';
import { StatusType } from '@edanalytics/utils';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import { DeepPartial, EntityManager, In, Repository } from 'typeorm';
import { CacheService } from '../app/cache.module';
import { AuthService } from '../auth/auth.service';
import { StartingBlocksService } from '../tenants/sbes/starting-blocks/starting-blocks.service';
import { throwNotFound } from '../utils';
import { WorkflowFailureException } from '../utils/customExceptions';

@Injectable()
export class SbesGlobalService {
  constructor(
    @InjectRepository(Sbe)
    private sbesRepository: Repository<Sbe>,
    private readonly sbService: StartingBlocksService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,

    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(CacheService) private cacheManager: CacheService
  ) {}
  create(createSbeDto: PostSbeDto) {
    return this.sbesRepository.save(this.sbesRepository.create(createSbeDto));
  }

  async findOne(id: number) {
    return this.sbesRepository.findOneByOrFail({ id });
  }

  async updateAdminApi(id: number, updateDto: PutSbeAdminApi) {
    const old = await this.findOne(id);
    return this.sbesRepository.save({
      ...old,
      modifiedById: updateDto.modifiedById,
      configPublic: {
        ...old.configPublic,
        adminApiKey: updateDto.adminKey,
        adminApiUrl: updateDto.adminUrl,
      },
      configPrivate: {
        ...old.configPrivate,
        adminApiSecret: updateDto.adminSecret,
      },
    });
  }

  async updateSbMeta(id: number, updateDto: PutSbeMeta) {
    const old = await this.findOne(id);
    return this.sbesRepository.save({
      ...old,
      modifiedById: updateDto.modifiedById,
      configPublic: {
        ...old.configPublic,
        sbeMetaKey: updateDto.metaKey,
        sbeMetaArn: updateDto.arn,
      },
      configPrivate: {
        ...old.configPrivate,
        sbeMetaSecret: updateDto.metaSecret,
      },
    });
  }

  async selfRegisterAdminApi(sbe: Sbe, updateDto: PutSbeAdminApiRegister) {
    const registrationResult = await this.sbService.selfRegisterAdminApi(
      updateDto.adminRegisterUrl
    );

    if (registrationResult.status === 'SUCCESS') {
      const { credentials } = registrationResult;
      return {
        status: registrationResult.status,
        result: await this.sbesRepository.save({
          ...sbe,
          modifiedById: updateDto.modifiedById,
          configPublic: {
            ...sbe.configPublic,
            adminApiKey: credentials.ClientId,
            adminApiUrl: updateDto.adminRegisterUrl,
            adminApiClientDisplayName: credentials.DisplayName,
          },
          configPrivate: {
            ...sbe.configPrivate,
            adminApiSecret: credentials.ClientSecret,
          },
        }),
      };
    } else {
      return registrationResult;
    }
  }

  async remove(id: number, user: GetUserDto) {
    const old = await this.findOne(id).catch(throwNotFound);
    await this.sbesRepository.remove(old);
    return undefined;
  }

  async checkSbMeta(sbeId: number) {
    const sbe = await this.findOne(sbeId).catch(throwNotFound);
    const sbMetaResult = await this.sbService.getSbMeta(sbeId);
    const sbMeta = sbMetaResult.status === 'SUCCESS';

    await this.sbesRepository.save({
      ...sbe,
      configPublic: {
        ...sbe.configPublic,
        ...(sbMeta
          ? {
              lastSuccessfulConnectionSbMeta: new Date(),
            }
          : {
              lastFailedConnectionSbMeta: new Date(),
            }),
      },
    });

    if (sbMeta) {
      return toOperationResultDto({
        title: 'SB Metadata connection successful.',
        status: StatusType.success,
        regarding: regarding(sbe),
      });
    }

    const sbMetaMsg =
      sbMetaResult.status === 'INVALID_ARN'
        ? 'Invalid ARN provided for metadata function.'
        : sbMetaResult.error
        ? sbMetaResult.error
        : undefined;

    throw new WorkflowFailureException({
      title: 'SB Metadata connection unsuccessful.',
      status: StatusType.error,
      message: sbMetaMsg,
      regarding: regarding(sbe),
    });
  }

  async checkAdminAPI(sbeId: number) {
    const sbe = await this.findOne(sbeId).catch(throwNotFound);
    const loginResult = await this.sbService.logIntoAdminApi(sbe);
    const adminApi = loginResult.status === 'SUCCESS';

    await this.sbesRepository.save({
      ...sbe,
      configPublic: {
        ...sbe.configPublic,
        ...(adminApi
          ? {
              lastSuccessfulConnectionAdminApi: new Date(),
            }
          : {
              lastFailedConnectionAdminApi: new Date(),
            }),
      },
    });

    if (adminApi) {
      return toOperationResultDto({
        title: 'Admin API connection successful.',
        status: StatusType.success,
        regarding: regarding(sbe),
      });
    }

    const adminApiMsg =
      loginResult.status === 'INVALID_ADMIN_API_URL'
        ? 'Invalid URL.'
        : loginResult.status === 'NO_ADMIN_API_URL'
        ? 'No URL provided.'
        : loginResult.status === 'LOGIN_FAILED'
        ? 'Unknown failure.'
        : undefined;

    throw new WorkflowFailureException({
      title: 'Admin API connection unsuccessful.',
      status: StatusType.error,
      message: adminApiMsg,
      regarding: regarding(sbe),
    });
  }
  async update(id: number, updateSbeDto: PutSbeDto) {
    const old = await this.findOne(id);
    return this.sbesRepository.save({ ...old, ...updateSbeDto });
  }

  async refreshResources(sbeId: number, user: GetUserDto | undefined) {
    type SbMetaEdorgFlat = SbMetaEdorg & {
      dbname: SbMetaOds['dbname'];
      parent?: SbMetaEdorg['educationorganizationid'];
    };
    const sbOdss: SbMetaOds[] = [];
    const sbEdorgs: SbMetaEdorgFlat[] = [];
    let sbe: Sbe;

    try {
      sbe = await this.findOne(sbeId);
    } catch (notFound) {
      throw new NotFoundException(`SBE ${sbeId} not found`);
    }

    const sbMeta = await this.sbService.getSbMeta(sbeId);
    if (sbMeta.status === 'INVALID_ARN') {
      throw new WorkflowFailureException({
        status: StatusType.error,
        title: 'Metadata retrieval failed.',
        message: 'Invalid ARN for metadata lambda function.',
        regarding: regarding(sbe),
      });
    } else if (sbMeta.status === 'FAILURE') {
      throw new WorkflowFailureException({
        status: StatusType.error,
        title: 'Matadata retrieval failed.',
        message: sbMeta.error,
        regarding: regarding(sbe),
      });
    } else if (sbMeta.status === 'SUCCESS') {
      const sbMetaValue = sbMeta.data;
      try {
        sbOdss.push(...(sbMetaValue.odss ?? []));
        sbMetaValue.odss?.forEach((ods) => {
          const pushEdOrgs = (
            edorg: SbMetaEdorg,
            parent?: SbMetaEdorg['educationorganizationid']
          ) => {
            const edorgFlat = {
              ...edorg,
              dbname: ods.dbname,
              parent,
            };
            sbEdorgs.push(edorgFlat);
            edorg.edorgs?.forEach((childEdorg) =>
              pushEdOrgs(childEdorg, edorgFlat.educationorganizationid)
            );
          };
          ods.edorgs?.forEach((edorg) => pushEdOrgs(edorg));
        });

        return await this.entityManager
          .transaction(async (em) => {
            const odsRepo = em.getRepository(Ods);
            const edorgRepo = em.getRepository(Edorg);

            const existingOdss = await odsRepo.find({
              where: {
                sbeId,
              },
            });

            const odssToDelete = new Set(existingOdss.map((o) => o.id));
            /**
             * get ods ID given ods dbname
             */
            const odsMap = Object.fromEntries(existingOdss.map((o) => [o.dbName, o]));
            const newOdss = sbOdss.flatMap((sbOds) => {
              if (sbOds.dbname in odsMap) {
                const id = odsMap[sbOds.dbname].id;
                if (id === undefined) {
                  Logger.error('ODS id-dbName map failed');
                }
                odssToDelete.delete(id);
                return [];
              } else {
                return [
                  addUserCreating(
                    odsRepo.create({
                      sbeId,
                      dbName: sbOds.dbname,
                    }),
                    user
                  ),
                ];
              }
            });

            (await odsRepo.save(newOdss)).forEach((ods) => {
              odsMap[ods.dbName] = ods;
            });

            await odsRepo.delete({
              id: In([...odssToDelete.values()]),
            });

            const existingEdorgs = await edorgRepo.find({
              where: {
                sbeId,
              },
            });

            /**
             * get edorg ID given ods ID and edorg educationorganizationid
             */
            const odsEdorgMap = Object.fromEntries(
              Object.values(odsMap).map((ods) => [ods.id, new Map<number, Edorg>()])
            );

            existingEdorgs.forEach((edorg) => {
              odsEdorgMap[edorg.odsId].set(edorg.educationOrganizationId, edorg);
            });
            const edorgsToSave: DeepPartial<Edorg>[] = [];

            sbEdorgs.forEach((sbeEdorg) => {
              const partialEdorgEntity: Partial<Edorg> = {
                sbeId,
                odsId: odsMap[sbeEdorg.dbname].id,
                odsDbName: sbeEdorg.dbname,
                educationOrganizationId: sbeEdorg.educationorganizationid,
                discriminator: sbeEdorg.discriminator,
                nameOfInstitution: sbeEdorg.nameofinstitution,
                shortNameOfInstitution: sbeEdorg.shortnameofinstitution,
              };
              if (
                !odsEdorgMap[partialEdorgEntity.odsId]?.has(
                  partialEdorgEntity.educationOrganizationId
                )
              ) {
                edorgsToSave.push(edorgRepo.create(addUserCreating(partialEdorgEntity, user)));
              }
            });
            const newEdorgs = await edorgRepo.save(edorgsToSave);
            newEdorgs.forEach((edorg) => {
              odsEdorgMap[edorg.odsId].set(edorg.educationOrganizationId, edorg);
            });

            const edorgsToDelete: Set<number> = new Set(existingEdorgs.map((e) => e.id));
            const edorgsToUpdate: Edorg[] = [];

            sbEdorgs.forEach((sbEdorg) => {
              const existing = odsEdorgMap[odsMap[sbEdorg.dbname].id].get(
                sbEdorg.educationorganizationid
              );
              const parent: Edorg | undefined = odsEdorgMap[odsMap[sbEdorg.dbname].id].get(
                sbEdorg.parent
              );
              const correctValues: DeepPartial<Edorg> = {
                ...(parent ? { parent } : {}),
                discriminator: sbEdorg.discriminator,
                nameOfInstitution: sbEdorg.nameofinstitution,
                shortNameOfInstitution: sbEdorg.shortnameofinstitution,
              };
              if (!_.isMatch(existing, correctValues)) {
                edorgsToUpdate.push(Object.assign(existing, correctValues));
              }
              edorgsToDelete.delete(existing.id);
            });

            await edorgRepo.save(edorgsToUpdate);
            await edorgRepo.delete({
              id: In([...edorgsToDelete]),
            });
            await this.sbesRepository.save({
              ...sbe,
              envLabel: sbMetaValue.envlabel,
              configPublic: {
                ...sbe.configPublic,
                lastSuccessfulPull: new Date(),
                edfiHostname: sbMetaValue.domainName,
              },
            });

            if (newEdorgs.length || edorgsToDelete.size || newOdss.length || odssToDelete.size) {
              const activeCacheKeys = this.cacheManager.keys();
              const reloadCaches = async () => {
                const start = Number(new Date());
                const logger = setInterval(() => {
                  Logger.log(`Rebuilding tenant caches. ${Number(new Date()) - start}ms elapsed.`);
                });
                for (let i = 0; i < activeCacheKeys.length; i++) {
                  const key = activeCacheKeys[i];
                  await this.authService.reloadTenantOwnershipCache(Number(key));
                }
                clearInterval(logger);
              };
              reloadCaches();
            }

            return toOperationResultDto({
              title: `Sync succeeded`,
              status: StatusType.success,
              message: `${sbEdorgs.length} total Ed-Orgs (${newEdorgs.length} added, ${edorgsToDelete.size} deleted), ${sbOdss.length} total ODS's. (${newOdss.length} added, ${odssToDelete.size} deleted).`,
              regarding: regarding(sbe),
            });
          })
          .catch(async (err) => {
            // Log the failure on the Sbe entity...
            await this.sbesRepository.save({
              ...sbe,
              configPublic: {
                ...sbe.configPublic,
                lastFailedPull: new Date(),
              },
            });
            // ...but then continue the Exception
            throw err;
          });
      } catch (TransformationErr) {
        Logger.log(TransformationErr);
        throw new WorkflowFailureException({
          status: StatusType.error,
          title: 'Unexpected error in transformation and sync.',
          regarding: regarding(sbe),
        });
      }
    }
  }
}
