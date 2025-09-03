import { Injectable, Logger } from '@nestjs/common';
import { ValidationHttpException, determineVersionFromMetadata, determineTenantModeFromMetadata, fetchOdsApiMetadata } from '../utils';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { addUserCreating, EdfiTenant, SbEnvironment } from '@edanalytics/models-server';
import { EntityManager, Repository } from 'typeorm';
import {
  StartingBlocksServiceV1,
  StartingBlocksServiceV2,
} from '../teams/edfi-tenants/starting-blocks';
import { PostSbEnvironmentDto, SbV1MetaEnv, EdorgType, SbV2MetaEnv, SbV2MetaOds, PostSbEnvironmentTenantDTO, GetUserDto } from '@edanalytics/models';
import axios from 'axios';
import { persistSyncTenant, SyncableOds } from '../sb-sync/sync-ods';
import { randomUUID } from 'crypto';

@Injectable()
export class SbEnvironmentsEdFiService {
  private readonly logger = new Logger(SbEnvironmentsEdFiService.name);

  constructor(
    @InjectRepository(SbEnvironment)
    private sbEnvironmentsRepository: Repository<SbEnvironment>,
    private readonly startingBlocksServiceV1: StartingBlocksServiceV1,
    private readonly startingBlocksServiceV2: StartingBlocksServiceV2,
    @InjectRepository(EdfiTenant)
    private edfiTenantsRepository: Repository<EdfiTenant>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) { }

  async create(createSbEnvironmentDto: PostSbEnvironmentDto, user: GetUserDto | undefined) {
    // Validate ODS Discovery URL if provided
    if (createSbEnvironmentDto.odsApiDiscoveryUrl) {
      try {
        // Fetch ODS API metadata
        const odsApiMetaResponse = await fetchOdsApiMetadata(createSbEnvironmentDto);

        // Auto-detect version from metadata
        const detectedVersion = determineVersionFromMetadata(odsApiMetaResponse);

        // Override the version with detected version
        createSbEnvironmentDto.version = detectedVersion;

        // Determine tenant mode
        const tenantMode = determineTenantModeFromMetadata(odsApiMetaResponse);
        createSbEnvironmentDto.isMultitenant = tenantMode === 'MultiTenant';

        // Replace the current configPublic logic with this:
        const configPublic = createSbEnvironmentDto.version === 'v1'
          ? {
            startingBlocks: createSbEnvironmentDto.startingBlocks,
            odsApiMeta: odsApiMetaResponse,
            adminApiUrl: createSbEnvironmentDto.adminApiUrl,
            version: createSbEnvironmentDto.version,
            values: {
              edfiHostname: createSbEnvironmentDto.odsApiDiscoveryUrl,
              adminApiUrl: createSbEnvironmentDto.adminApiUrl,
            },
          }
          : {
            startingBlocks: createSbEnvironmentDto.startingBlocks,
            odsApiMeta: odsApiMetaResponse,
            adminApiUrl: createSbEnvironmentDto.adminApiUrl,
            version: createSbEnvironmentDto.version,
            values: {
              meta: {
                envlabel: createSbEnvironmentDto.environmentLabel,
                mode: tenantMode,
                domainName: createSbEnvironmentDto.odsApiDiscoveryUrl,
                adminApiUrl: createSbEnvironmentDto.adminApiUrl,
                tenantManagementFunctionArn: '',
                tenantResourceTreeFunctionArn: '',
                odsManagementFunctionArn: '',
                edorgManagementFunctionArn: '',
                dataFreshnessFunctionArn: '',
              } satisfies SbV2MetaEnv,
              adminApiUuid: randomUUID(),
            },
          };
        Logger.log(`Auto-detected API version: ${detectedVersion} from ODS version: ${odsApiMetaResponse.version}`);
        const sbEnvironment = await this.sbEnvironmentsRepository.save(
          addUserCreating(
            this.sbEnvironmentsRepository.create({
              name: createSbEnvironmentDto.name,
              envLabel: createSbEnvironmentDto.environmentLabel, //this field is for the lambda function
              configPublic: configPublic,
            } as SbEnvironment),
            user
          )
        );

        // Need to create the ODS and Edorgs, in v1 it's going to create a default tenant
        if (createSbEnvironmentDto.version === 'v1') {
          this.syncv1Environment(sbEnvironment, createSbEnvironmentDto);
          // Make a POST request to register the client
          const { clientId, clientSecret } =
            await this.createClientCredentials(createSbEnvironmentDto);

          // Save the admin API credentials
          const credentials = {
            ClientId: clientId,
            ClientSecret: clientSecret,
            url: createSbEnvironmentDto.adminApiUrl,
          };
          await this.startingBlocksServiceV1.saveAdminApiCredentials(sbEnvironment, credentials);
        } else if (createSbEnvironmentDto.version === 'v2') {
          // For v2, we need to investigate if applies the same process
          await this.syncv2Environment(sbEnvironment, createSbEnvironmentDto);
        }

        return sbEnvironment;
      } catch (error) {
        // Enhanced error logging
        console.error('Fetch error details:', {
          url: createSbEnvironmentDto.odsApiDiscoveryUrl,
          error: error.message,
          code: error.code, // Node.js specific error codes
          cause: error.cause,
        });

        let message: string;

        if (error instanceof Error) {
          // Check for specific error types
          if (error.message.includes('ECONNREFUSED')) {
            message = 'Connection refused - service may not be running';
          } else if (error.message.includes('ENOTFOUND')) {
            message = 'Host not found - check the URL';
          } else if (error.message.includes('certificate')) {
            message = 'SSL certificate error - check certificate configuration';
          } else if (error.message.includes('ECONNRESET')) {
            message = 'Connection reset - service may have closed the connection';
          } else {
            message = `Failed to fetch ODS Discovery URL: ${error.message}`;
          }
        } else {
          message = 'Invalid or unreachable ODS Discovery URL.';
        }

        throw new ValidationHttpException({
          field: 'odsApiDiscoveryUrl',
          message,
        });
      }
    }
  }

  private async syncv1Environment(sbEnvironment: SbEnvironment, createSbEnvironmentDto: PostSbEnvironmentDto) {
    const metaV1 = {
      envlabel: sbEnvironment.envLabel,
      mode: 'DistrictSpecific', //Not sure if this is correct, but it seems to be the case
      domainName: sbEnvironment.configPublic.odsApiMeta.urls.dataManagementApi,
      odss: [
        {
          dbname: 'EdFi_Ods_255901', // Not sure if we need to include the dbname here
          edorgs: createSbEnvironmentDto.edOrgIds
            ? createSbEnvironmentDto.edOrgIds.split(',').map(id => {
              const trimmedId = id.trim();
              return {
                educationorganizationid: parseInt(trimmedId, 10),
                nameofinstitution: trimmedId,
                shortnameofinstitution: trimmedId,
                discriminator: EdorgType['edfi.Other'],
              };
            })
            : [
              {
                educationorganizationid: 1,
                nameofinstitution: 'Default EdOrg',
                shortnameofinstitution: 'Default',
                discriminator: EdorgType['edfi.Other'],
              }
            ],
        },
      ],
    } as SbV1MetaEnv;
    //Let's sync the odss and edorgs
    const result = await this.startingBlocksServiceV1.syncEnvironmentEverything(
      sbEnvironment,
      metaV1
    );
    if (result.status !== 'SUCCESS') {
      throw new ValidationHttpException({
        field: 'odsApiDiscoveryUrl',
        message: `Failed to sync environment: ${result.status}`,
      });
    }
  }

  private async syncv2Environment(sbEnvironment: SbEnvironment, createSbEnvironmentDto: PostSbEnvironmentDto) {
    try {
      if (createSbEnvironmentDto.isMultitenant) {
        return await this.syncMultiTenantEnvironment(sbEnvironment, createSbEnvironmentDto);
      } else {
        return await this.syncSingleTenantEnvironment(sbEnvironment, createSbEnvironmentDto);
      }
    } catch (operationError) {
      this.logger.error('Failed to sync v2 environment:', operationError);
      throw new ValidationHttpException({
        field: 'tenants',
        message: operationError.message
          ? (operationError.message as string)
          : 'Failed on syncv2Environment',
      });
    }
  }

  private async syncMultiTenantEnvironment(sbEnvironment: SbEnvironment, createSbEnvironmentDto: PostSbEnvironmentDto) {
    if (!createSbEnvironmentDto.tenants || createSbEnvironmentDto.tenants.length === 0) {
      throw new ValidationHttpException({
        field: 'tenants',
        message: 'At least one tenant is required for multi-tenant deployment',
      });
    }

    for (const tenant of createSbEnvironmentDto.tenants) {
      await this.createAndSyncTenant(sbEnvironment, createSbEnvironmentDto, tenant);
    }

    return { status: 'SUCCESS' as const };
  }

  private async syncSingleTenantEnvironment(sbEnvironment: SbEnvironment, createSbEnvironmentDto: PostSbEnvironmentDto) {
    // For single-tenant, use the first tenant from the frontend data
    if (!createSbEnvironmentDto.tenants || createSbEnvironmentDto.tenants.length === 0) {
      throw new ValidationHttpException({
        field: 'tenants',
        message: 'At least one tenant is required for single-tenant deployment',
      });
    }

    const defaultTenantDto = createSbEnvironmentDto.tenants[0];

    // Find or create the default tenant
    const edfiTenant = await this.findOrCreateTenant(sbEnvironment, defaultTenantDto.name);

    // Sync the tenant data
    await this.syncTenantData(sbEnvironment, createSbEnvironmentDto, defaultTenantDto, edfiTenant);

    return { status: 'SUCCESS' as const };
  }

  private async createAndSyncTenant(
    sbEnvironment: SbEnvironment,
    createSbEnvironmentDto: PostSbEnvironmentDto,
    tenantDto: PostSbEnvironmentTenantDTO
  ) {
    // Create the tenant in the local database
    const tenantEntity = await this.edfiTenantsRepository.save({
      name: tenantDto.name,
      sbEnvironmentId: sbEnvironment.id,
    });

    await this.syncTenantData(sbEnvironment, createSbEnvironmentDto, tenantDto, tenantEntity);
  }

  private async findOrCreateTenant(sbEnvironment: SbEnvironment, tenantName: string): Promise<EdfiTenant> {
    const existingTenants = await this.edfiTenantsRepository.find({
      where: { sbEnvironmentId: sbEnvironment.id },
    });

    if (existingTenants.length === 0) {
      return await this.edfiTenantsRepository.save({
        name: tenantName,
        sbEnvironmentId: sbEnvironment.id,
      });
    }

    return existingTenants[0];
  }

  private async syncTenantData(
    sbEnvironment: SbEnvironment,
    createSbEnvironmentDto: PostSbEnvironmentDto,
    tenantDto: PostSbEnvironmentTenantDTO,
    tenantEntity: EdfiTenant
  ) {
    // Create ODS metadata objects
    const metaOds: SbV2MetaOds[] = this.createODSObject(tenantDto);

    // Sync ODS and EdOrgs
    await this.saveSyncableOds(metaOds, tenantEntity);

    // Create Admin API credentials
    await this.createAdminAPICredentialsV2(createSbEnvironmentDto, tenantEntity, sbEnvironment);
  }


  private async createAdminAPICredentialsV2(createSbEnvironmentDto: PostSbEnvironmentDto, tenantEntity: { name: string; sbEnvironmentId: number; } & EdfiTenant, sbEnvironment: SbEnvironment) {
    const { clientId, clientSecret } = await this.createClientCredentials(createSbEnvironmentDto, tenantEntity.name);
    await this.startingBlocksServiceV2.saveAdminApiCredentials(tenantEntity, sbEnvironment, { ClientId: clientId, ClientSecret: clientSecret, url: createSbEnvironmentDto.adminApiUrl });
  }

  private createODSObject(tenant: PostSbEnvironmentTenantDTO): SbV2MetaOds[] {
    return tenant.odss?.map((ods) => ({
      id: ods.id, // the ID of the ODS instance, it has to be get it from adminapi/db
      name: ods.name, // The ODS name
      dbname: ods.dbName,
      edorgs: ods.allowedEdOrgs
        ?.split(',')
        .map(id => id.trim())
        .filter(edorg => edorg !== '' && !isNaN(Number(edorg)))
        .map((edorg) => ({
          educationorganizationid: parseInt(edorg),
          nameofinstitution: `Institution #${edorg}`,
          shortnameofinstitution: `I#${edorg}`,
          id: edorg,
          discriminator: EdorgType['edfi.Other'],
          name: `Institution #${edorg}`,
        }))
    })) || [];
  }

  private async saveSyncableOds(metaOds: SbV2MetaOds[], tenantEntity: { name: string; sbEnvironmentId: number; } & EdfiTenant) {
    const odss = (metaOds ?? []).map(
      (o): SyncableOds => ({
        ...o,
        dbName: o.dbname,
      })
    );
    // Store the data in the localDB
    await this.entityManager.transaction((em) => persistSyncTenant({ em, odss, edfiTenant: tenantEntity })
    );
  }

  private async createClientCredentials(createSbEnvironmentDto: PostSbEnvironmentDto, tenant?: string) {
    const registerUrl = `${createSbEnvironmentDto.adminApiUrl}/connect/register`;
    const clientSecret = Array.from({ length: 32 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'.charAt(
        Math.floor(Math.random() * 70),
      ),
    ).join('');
    const clientId = `client_${Math.random().toString(36).substring(2, 15)}`;
    const displayName = `AdminApp-v4-${Math.random().toString(36).substring(2, 8)}`;
    const formData = new URLSearchParams();
    formData.append('ClientId', clientId);
    formData.append('ClientSecret', clientSecret);
    formData.append('DisplayName', displayName);

    const headers = createSbEnvironmentDto.isMultitenant && createSbEnvironmentDto.version === 'v2' ? {
      'Content-Type': 'application/x-www-form-urlencoded',
      'tenant': tenant,
    } : {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const registerResponse = await axios.post(registerUrl, formData.toString(), {
      headers: headers,
    });

    if (!registerResponse.status || registerResponse.status !== 200) {
      throw new Error(`Registration failed! status: ${registerResponse.status}`);
    }
    return { clientId, displayName, clientSecret };
  }
}
