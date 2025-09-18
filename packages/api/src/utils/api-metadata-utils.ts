import { Logger } from '@nestjs/common';
import { PostSbEnvironmentDto, OdsApiMeta } from '@edanalytics/models';
import axios from 'axios';
import { ValidationHttpException } from './customExceptions';

/**
 * Determines the API version (v1 or v2) from ODS API metadata
 */
export const determineVersionFromMetadata = (odsApiMeta: OdsApiMeta): 'v1' | 'v2' => {
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
};

/**
 * Determines the tenant mode (MultiTenant or SingleTenant) from ODS API metadata
 */
export const determineTenantModeFromMetadata = (odsApiMeta: OdsApiMeta): 'MultiTenant' | 'SingleTenant' => {
  try {
    // Extract urls from metadata
    const urls = odsApiMeta.urls;

    if (!urls) {
      Logger.warn('No URLs found in ODS API metadata, defaulting to MultiTenant');
      return 'MultiTenant';
    }

    // Determine tenant mode based on the presence of specific URL segment
    if (urls.dataManagementApi.includes('tenantIdentifier')) {
      return 'MultiTenant';
    } else {
      return 'SingleTenant';
    }
  } catch (error) {
    Logger.warn('Failed to parse tenant mode from metadata, defaulting to MultiTenant:', error);
    return 'MultiTenant';
  }
};

/**
 * Fetches ODS API metadata from the discovery URL
 */
export const fetchOdsApiMetadata = async (createSbEnvironmentDto: PostSbEnvironmentDto) => {
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
};

/**
 * Validates the Management API Discovery URL.
 * @param adminApiUrl The URL to validate.
 * @returns A promise that resolves if the URL is valid, or rejects with a ValidationHttpException if it is not.
 */

export const validateAdminApiUrl = async (adminApiUrl: string): Promise<void> => {
  if (!adminApiUrl) {
    throw new ValidationHttpException({
      field: 'adminApiUrl',
      message: 'Management API Discovery URL is required',
    });
  }

  try {
    const response = await axios.get(`${adminApiUrl}/health`, {
      headers: {
        Accept: 'application/json',
      },
    });
    
    if (response.status !== 200) {
      throw new ValidationHttpException({
        field: 'adminApiUrl',
        message: `Failed to validate Management API Discovery URL: ${response.statusText}`,
      });
    }
  } catch (error) {
    throw new ValidationHttpException({
      field: 'adminApiUrl',
      message: 'Failed to connect to Management API Discovery URL. Please check the URL and ensure it is valid.',
    });
  }
};

