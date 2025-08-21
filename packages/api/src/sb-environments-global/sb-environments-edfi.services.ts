import { Injectable, Logger } from '@nestjs/common';
import { ValidationHttpException } from '../utils';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { addUserCreating, EdfiTenant, SbEnvironment } from '@edanalytics/models-server';
import { EntityManager, Repository } from 'typeorm';
import {
  StartingBlocksServiceV1,
  StartingBlocksServiceV2,
} from '../teams/edfi-tenants/starting-blocks';
import { PostSbEnvironmentDto, SbV1MetaEnv, EdorgType, SbV2MetaEnv, SbV2MetaOds, PostSbEnvironmentTenantDTO, OdsApiMeta, GetUserDto } from '@edanalytics/models';
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
        const odsApiMetaResponse = await this.fetchOdsApiMetadata(createSbEnvironmentDto);

        // Auto-detect version from metadata
        const detectedVersion = this.determineVersionFromMetadata(odsApiMetaResponse);

        // Override the version with detected version
        createSbEnvironmentDto.version = detectedVersion;

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
                mode: 'MultiTenant' as const,
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
        // const multitenantMode = createSbEnvironmentDto.isMultitenant ? "MultiTenant" : "SingleTenant";
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

  public determineVersionFromMetadata(odsApiMeta: OdsApiMeta): 'v1' | 'v2' {
    try {
      // Extract version from metadata
      const version = odsApiMeta.version;

      if (!version) {
        Logger.warn('No version found in ODS API metadata, defaulting to v1');
        return 'v1';
      }

      // Parse the major version number correctly from semantic version string
      const majorVersion = parseInt(version.split('.')[0], 10);

      if (majorVersion >= 7) {
        return 'v2';
      } else {
        return 'v1';
      }
    } catch (error) {
      Logger.warn('Failed to parse version from metadata, defaulting to v1:', error);
      return 'v1';
    }
  }

  public async fetchOdsApiMetadata(createSbEnvironmentDto: PostSbEnvironmentDto) {
    const response = await axios.get(createSbEnvironmentDto.odsApiDiscoveryUrl, {
      headers: {
        Accept: 'application/json',
      },
    });
    if (response.status !== 200) {
      throw new Error(`Failed to fetch ODS API metadata: ${response.statusText}`);
    }
    // Optionally validate the response contains expected discovery document structure
    const odsApiMetaResponse = response.data;
    return odsApiMetaResponse;
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
    /*
        - Call a lambda to get some configuration like the ODS/API, adminapi and other lambda urls
        - Get the metadata from ODS/API
        - Save the sb env in the local database
        - Get the tenants from a lambda where they return the name and a list of edorgids number[] per tenant.
        depending on that, it has to be created or removed from the local tenants table
    */
    try {
      if (createSbEnvironmentDto.tenants && createSbEnvironmentDto.tenants.length > 0) {
        for (const tenant of createSbEnvironmentDto.tenants) {
          // Let's create the tenant in the localDB
          const tenantEntity = await this.edfiTenantsRepository.save({
            name: tenant.name,
            sbEnvironmentId: sbEnvironment.id,
          });
          // Create the object
          const metaOds: SbV2MetaOds[] = this.createODSObject(tenant);

          // Let's create the ODS and Edorgs
          await this.saveSyncableOds(metaOds, tenantEntity);
          // Let's create the Admin API credentials
          await this.createAdminAPICredentialsV2(createSbEnvironmentDto, tenantEntity, sbEnvironment);

        }
        return {
          status: 'SUCCESS' as const,
        };
      }
      else {
        throw new ValidationHttpException({
          field: 'tenants',
          message: 'At least one tenant is required for multi-tenant deployment',
        });
      }
    }
    catch (operationError) {
      this.logger.error(operationError);
      throw new ValidationHttpException({
        field: 'tenants',
        message: operationError.message
          ? (operationError.message as string)
          : 'Failed on syncv2Environment',
      });
    }
  }


  private async createAdminAPICredentialsV2(createSbEnvironmentDto: PostSbEnvironmentDto, tenantEntity: { name: string; sbEnvironmentId: number; } & EdfiTenant, sbEnvironment: SbEnvironment) {
    const { clientId, displayName, clientSecret } = await this.createClientCredentials(createSbEnvironmentDto, tenantEntity.name);
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
