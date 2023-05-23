import {
  BasePrivilege,
  PrivilegeCode,
  TenantBasePrivilege,
  TenantSbePrivilege,
} from '@edanalytics/models';
import { SetMetadata } from '@nestjs/common';

export const AUTHORIZE_KEY = 'authorize_rule';

export type AuthorizeMetadata<
  PrivilegeType extends
    | BasePrivilege
    | TenantBasePrivilege
    | TenantSbePrivilege = PrivilegeCode
> = {
  privilege: PrivilegeType;
  subject: (PrivilegeType extends BasePrivilege
    ? object
    : { tenantId: 'tenantId' }) &
    (PrivilegeType extends TenantSbePrivilege ? { sbeId: 'sbeId' } : object) & {
      id: string | '__filtered__';
    };
};

export const Authorize = <
  PrivilegeType extends BasePrivilege | TenantBasePrivilege | TenantSbePrivilege
>(
  config: AuthorizeMetadata<PrivilegeType>
) => SetMetadata(AUTHORIZE_KEY, config);
