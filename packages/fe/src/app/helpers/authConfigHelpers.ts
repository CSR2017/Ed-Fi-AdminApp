import {
  BasePrivilege,
  GetRoleDto,
  TenantBasePrivilege,
  TenantSbePrivilege,
} from '@edanalytics/models';
import { AuthorizeConfig } from '.';

export const tenantRoleAuthConfig = (
  roleId: number | '__filtered__' | undefined,
  tenantId: number | undefined,
  privilege: TenantBasePrivilege
): AuthorizeConfig | undefined =>
  roleId === undefined || tenantId === undefined
    ? undefined
    : {
        privilege,
        subject: {
          tenantId: tenantId,
          id: roleId,
        },
      };
export const globalOwnershipAuthConfig = (
  privilege: BasePrivilege
): AuthorizeConfig | undefined => ({
  privilege,
  subject: {
    id: '__filtered__',
  },
});

export const utmAuthConfig = (
  tenantId: number | undefined,
  privilege: TenantBasePrivilege
): AuthorizeConfig | undefined =>
  tenantId === undefined
    ? undefined
    : {
        privilege,
        subject: {
          tenantId: tenantId,
          id: '__filtered__',
        },
      };

export const ownershipAuthConfig = (
  tenantId: number | undefined,
  privilege: TenantBasePrivilege
): AuthorizeConfig | undefined =>
  tenantId === undefined
    ? undefined
    : {
        privilege,
        subject: {
          tenantId: tenantId,
          id: '__filtered__',
        },
      };

export const applicationAuthConfig = (
  edorgId: number | undefined,
  sbeId: number | undefined,
  tenantId: number | undefined,
  privilege: TenantSbePrivilege
): AuthorizeConfig | undefined =>
  edorgId === undefined || sbeId === undefined || tenantId === undefined
    ? undefined
    : {
        privilege,
        subject: {
          tenantId: tenantId,
          id: edorgId,
          sbeId: sbeId,
        },
      };

export const vendorAuthConfig = (
  sbeId: number | undefined,
  tenantId: number | undefined,
  privilege: TenantSbePrivilege
): AuthorizeConfig | undefined =>
  sbeId === undefined || tenantId === undefined
    ? undefined
    : {
        privilege,
        subject: {
          tenantId: tenantId,
          id: '__filtered__',
          sbeId: sbeId,
        },
      };

export const claimsetAuthConfig = (
  sbeId: number | undefined,
  tenantId: number | undefined,
  privilege: TenantSbePrivilege
): AuthorizeConfig | undefined =>
  sbeId === undefined || tenantId === undefined
    ? undefined
    : {
        privilege,
        subject: {
          tenantId: tenantId,
          id: '__filtered__',
          sbeId: sbeId,
        },
      };

export const odsAuthConfig = (
  odsId: number | '__filtered__' | undefined,
  sbeId: number | undefined,
  tenantId: number | undefined,
  privilege: TenantSbePrivilege
): AuthorizeConfig | undefined =>
  odsId === undefined || sbeId === undefined || tenantId === undefined
    ? undefined
    : {
        privilege,
        subject: {
          tenantId: tenantId,
          id: odsId,
          sbeId: sbeId,
        },
      };

export const sbeAuthConfig = (
  sbeId: number | '__filtered__' | undefined,
  tenantId: number | undefined,
  privilege: TenantBasePrivilege
): AuthorizeConfig | undefined =>
  sbeId === undefined || tenantId === undefined
    ? undefined
    : {
        privilege,
        subject: {
          tenantId: tenantId,
          id: sbeId,
        },
      };

export const globalSbeAuthConfig = (
  sbeId: number | '__filtered__' | undefined,
  privilege: BasePrivilege
): AuthorizeConfig | undefined =>
  sbeId === undefined
    ? undefined
    : {
        privilege,
        subject: {
          id: sbeId,
        },
      };

export const edorgAuthConfig = (
  edorgId: number | '__filtered__' | undefined,
  sbeId: number | undefined,
  tenantId: number | undefined,
  privilege: TenantSbePrivilege
): AuthorizeConfig | undefined =>
  edorgId === undefined || sbeId === undefined || tenantId === undefined
    ? undefined
    : {
        privilege,
        subject: {
          tenantId: tenantId,
          id: edorgId,
          sbeId: sbeId,
        },
      };
