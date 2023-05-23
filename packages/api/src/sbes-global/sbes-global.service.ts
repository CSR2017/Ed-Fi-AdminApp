import {
  GetUserDto,
  PostSbeDto,
  PutSbeDto,
  SbMetaEdorg,
  SbMetaOds,
} from '@edanalytics/models';
import {
  Edorg,
  Ods,
  Ownership,
  Sbe,
  addUserCreating,
} from '@edanalytics/models-server';
import { Injectable } from '@nestjs/common';
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

  async update(id: number, updateSbeDto: PutSbeDto) {
    const old = await this.findOne(id);
    return this.sbesRepository.save({ ...old, ...updateSbeDto });
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
    try {
      await this.sbService.logIntoAdminApi(sbe);
    } catch (adminApiFailed) {
      adminApi = false;
    }

    try {
      await this.sbService.getSbMeta(sbeId);
    } catch (adminApiFailed) {
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

    return {
      adminApi,
      sbMeta,
    };
  }

  async refreshResources(sbeId: number, user: GetUserDto) {
    type SbMetaEdorgFlat = SbMetaEdorg & {
      dbname: SbMetaOds['dbname'];
      parent?: SbMetaEdorg['educationorganizationid'];
    };
    const sbOdss: SbMetaOds[] = [];
    const sbEdorgs: SbMetaEdorgFlat[] = [];
    const sbe = await this.findOne(sbeId);

    const sbMeta = await this.sbService.getSbMeta(sbeId);
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
        const odsMap = Object.fromEntries(
          existingOdss.map((o) => [o.dbName, o])
        );
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
          Object.values(odsMap).map((ods) => [ods.id, new Map<string, Edorg>()])
        );

        existingEdorgs.forEach((edorg) => {
          odsEdorgMap[edorg.odsId].set(edorg.educationOrganizationId, edorg);
        });
        const edorgsToSave: DeepPartial<Edorg>[] = [];

        sbEdorgs.map((sbeEdorg) => {
          const partialEdorgEntity: Partial<Edorg> = {
            sbeId,
            odsId: odsMap[sbeEdorg.dbname].id,
            // parentId: odsEdorgMap[odsMap[sbeEdorg.dbname]].get(String(sbeEdorg.educationorganizationid))?.id,
            educationOrganizationId: String(sbeEdorg.educationorganizationid),
            discriminator: sbeEdorg.discriminator,
            nameOfInstitution: sbeEdorg.nameofinstitution,
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

        const edorgResourceIdsToDelete: Set<number> = new Set(
          existingEdorgs.map((e) => e.id)
        );
        const edorgsToUpdate: DeepPartial<Edorg>[] = [];

        sbEdorgs.forEach((sbEdorg) => {
          const existing = odsEdorgMap[odsMap[sbEdorg.dbname].id].get(
            String(sbEdorg.educationorganizationid)
          );
          const parent: Edorg | undefined = odsEdorgMap[
            odsMap[sbEdorg.dbname].id
          ].get(String(sbEdorg.parent));
          const correctValues: DeepPartial<Edorg> = {
            parentId: parent?.id ?? null,
            discriminator: sbEdorg.discriminator,
            nameOfInstitution: sbEdorg.nameofinstitution,
          };
          if (!_.isMatch(existing, correctValues)) {
            edorgsToUpdate.push({
              ...existing,
              ...correctValues,
            });
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
          configPublic: {
            ...sbe.configPublic,
            lastSuccessfulPull: new Date(),
          },
        });
      })
      .catch(async (err) => {
        await this.sbesRepository.save({
          ...sbe,
          configPublic: {
            ...sbe.configPublic,
            lastFailedPull: new Date(),
          },
        });
      });
    return {
      odsCount: sbOdss.length,
      edorgCount: sbEdorgs.length,
    };
  }
}
