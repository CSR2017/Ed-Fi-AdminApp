import {
  GetUserDto,
  OperationResultDto,
  PostSbeDto,
  PutSbeAdminApi,
  PutSbeAdminApiRegister,
  PutSbeMeta,
  SbMetaEdorg,
  SbMetaEnv,
  SbMetaOds,
  toOperationResultDto,
} from '@edanalytics/models';
import { Edorg, Ods, Ownership, Sbe, addUserCreating } from '@edanalytics/models-server';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import { DeepPartial, EntityManager, In, Repository } from 'typeorm';
import { StartingBlocksService } from '../tenants/sbes/starting-blocks/starting-blocks.service';

@Injectable()
export class SbesGlobalService {
  constructor(
    @InjectRepository(Sbe)
    private sbesRepository: Repository<Sbe>,
    @InjectRepository(Ownership)
    private ownershipsRepository: Repository<Ownership>,
    private readonly sbService: StartingBlocksService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager
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

  async selfRegisterAdminApi(id: number, updateDto: PutSbeAdminApiRegister) {
    const old = await this.findOne(id);
    const creds = await this.sbService.selfRegisterAdminApi(updateDto.adminRegisterUrl);

    return this.sbesRepository.save({
      ...old,
      modifiedById: updateDto.modifiedById,
      configPublic: {
        ...old.configPublic,
        adminApiKey: creds.ClientId,
        adminApiUrl: updateDto.adminRegisterUrl,
        adminApiClientDisplayName: creds.DisplayName,
      },
      configPrivate: {
        ...old.configPrivate,
        adminApiSecret: creds.ClientSecret,
      },
    });
  }

  async remove(id: number, user: GetUserDto) {
    const old = await this.findOne(id);
    await this.sbesRepository.update(id, {
      deleted: new Date(),
      deletedById: user.id,
    });
    return undefined;
  }

  async checkConnections(sbeId: number) {
    let adminApi = true;
    let sbMeta = true;

    const sbe = await this.findOne(sbeId);
    const messages = [];
    try {
      await this.sbService.logIntoAdminApi(sbe);
    } catch (err) {
      if (err?.message) {
        messages.push(`Admin API: ${err.message}`);
      }
      adminApi = false;
    }

    try {
      await this.sbService.getSbMeta(sbeId);
    } catch (err) {
      if (err?.message) {
        messages.push(`SB Meta: ${err.message}`);
      }
      sbMeta = false;
    }

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
        ...(sbMeta
          ? {
              lastSuccessfulConnectionSbMeta: new Date(),
            }
          : {
              lastFailedConnectionSbMeta: new Date(),
            }),
      },
    });

    return toOperationResultDto({
      title:
        adminApi && sbMeta
          ? 'Connections successsful'
          : adminApi
          ? 'SB Meta failed'
          : sbMeta
          ? 'Admin API failed'
          : 'Connections unsuccessful',
      id: sbeId,
      statuses: [
        { name: 'SB Meta', success: sbMeta },
        { name: 'Admin API', success: adminApi },
      ],
      messages,
    });
  }

  async refreshResources(sbeId: number, user: GetUserDto): Promise<OperationResultDto> {
    const messages = [];
    let retrieved = false;
    let synced = false;

    try {
      type SbMetaEdorgFlat = SbMetaEdorg & {
        dbname: SbMetaOds['dbname'];
        parent?: SbMetaEdorg['educationorganizationid'];
      };
      const sbOdss: SbMetaOds[] = [];
      const sbEdorgs: SbMetaEdorgFlat[] = [];
      const sbe = await this.findOne(sbeId);

      const sbMeta = await this.sbService.getSbMeta(sbeId);
      retrieved = true;
      try {
        sbOdss.push(...(sbMeta.odss ?? []));
        sbMeta.odss?.forEach((ods) => {
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

        await this.entityManager
          .transaction(async (em) => {
            const odsRepo = em.getRepository(Ods);
            const edorgRepo = em.getRepository(Edorg);

            const existingOdss = await odsRepo.find({
              where: {
                sbeId,
              },
            });

            const resourceIdsToDelete = new Set(existingOdss.map((o) => o.id));

            /**
             * get ods ID given ods dbname
             */
            const odsMap = Object.fromEntries(existingOdss.map((o) => [o.dbName, o]));
            const newOdsResources = sbOdss.flatMap((sbOds) => {
              if (sbOds.dbname in odsMap) {
                resourceIdsToDelete.delete(odsMap[sbOds.dbname].id);
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

            (await odsRepo.save(newOdsResources)).forEach((ods) => {
              odsMap[ods.dbName] = ods;
            });

            // await resourceRepo.remove(
            //   await resourceRepo.find({
            //     where: {
            //       id: In([...resourceIdsToDelete]),
            //     },
            //   })
            // );

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

            sbEdorgs.map((sbeEdorg) => {
              const partialEdorgEntity: Partial<Edorg> = {
                sbeId,
                odsId: odsMap[sbeEdorg.dbname].id,
                odsDbName: sbeEdorg.dbname,
                // parentId: odsEdorgMap[odsMap[sbeEdorg.dbname]].get(String(sbeEdorg.educationorganizationid))?.id,
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
                edorgsToSave.push(addUserCreating(partialEdorgEntity, user));
              }
            });
            const newEdorgs = await edorgRepo.save(
              edorgsToSave.map((edorg) => addUserCreating(edorg, user))
            );

            newEdorgs.forEach((edorg) => {
              odsEdorgMap[edorg.odsId].set(edorg.educationOrganizationId, edorg);
            });

            const edorgResourceIdsToDelete: Set<number> = new Set(existingEdorgs.map((e) => e.id));
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
                existing.discriminator = correctValues.discriminator;
                existing.nameOfInstitution = correctValues.nameOfInstitution;
                existing.shortNameOfInstitution = correctValues.shortNameOfInstitution;
                if (correctValues.parent) {
                  existing.parent = parent;
                }
                edorgsToUpdate.push(existing);
              }
              edorgResourceIdsToDelete.delete(existing.id);
            });

            await edorgRepo.save(edorgsToUpdate);
            await edorgRepo.remove(
              await edorgRepo.find({
                where: {
                  id: In([...edorgResourceIdsToDelete]),
                },
              })
            );
            await this.sbesRepository.save({
              ...sbe,
              envLabel: sbMeta.envlabel,
              configPublic: {
                ...sbe.configPublic,
                lastSuccessfulPull: new Date(),
                edfiHostname: sbMeta.domainName,
              },
            });
            messages.push(`Edorgs: ${sbEdorgs.length}`);
            messages.push(`ODS's: ${sbOdss.length}`);
            synced = true;
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
        if (TransformationErr.message) {
          messages.push(`Sync operation: ${TransformationErr.message}`);
        }
      }
    } catch (SbMetaErr) {
      Logger.log(SbMetaErr);
      if (SbMetaErr.message) {
        messages.push(`SB Meta: ${SbMetaErr.message}`);
      }
    }

    return toOperationResultDto({
      title: `Sync ${synced && retrieved ? 'succeded.' : 'failed.'}`,
      id: sbeId,
      messages,
      statuses: [
        { name: 'Sync', success: synced },
        { name: 'Retrieval', success: retrieved },
      ],
    });
  }
}
