import {
  BasePrivilege,
  PrivilegeCode,
  SpecificIds,
  TenantBasePrivilege,
  TenantSbePrivilege,
} from '@edanalytics/models';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { ReactElement } from 'react';
import { usePrivilegeCache } from '../api';

export type AuthorizeConfig<
  PrivilegeType extends BasePrivilege | TenantBasePrivilege | TenantSbePrivilege = PrivilegeCode
> = {
  privilege: PrivilegeType;
  subject: (PrivilegeType extends BasePrivilege ? object : { tenantId: number }) &
    (PrivilegeType extends TenantSbePrivilege ? { sbeId: number } : object) & {
      id: string | number | '__filtered__';
    };
};

export type AuthorizeParameters<
  PrivilegeType extends BasePrivilege | TenantBasePrivilege | TenantSbePrivilege,
  ValueType
> = {
  value: ValueType;
  config: undefined | AuthorizeConfig<PrivilegeType> | AuthorizeConfig<PrivilegeType>[];
};

export const authorize = <
  PrivilegeType extends BasePrivilege | TenantBasePrivilege | TenantSbePrivilege
>(props: {
  queryClient: QueryClient;
  config: undefined | AuthorizeConfig<PrivilegeType> | AuthorizeConfig<PrivilegeType>[];
}) => {
  const configArray = Array.isArray(props.config)
    ? props.config
    : props.config === undefined
    ? []
    : [props.config];

  let isAuthorized =
    props.config !== undefined && (!Array.isArray(props.config) || props.config.length > 0);

  configArray.forEach((config, i) => {
    const thisPrivilegeCache = props.queryClient.getQueryData<boolean | SpecificIds>([
      'authorizations',
      'tenantId' in config.subject ? config.subject.tenantId : undefined,
      'sbeId' in config.subject ? config.subject.sbeId : undefined,
      config.privilege,
    ]);

    if (thisPrivilegeCache === false || thisPrivilegeCache === undefined) {
      isAuthorized = false;
    } else if (thisPrivilegeCache === true) {
      // no change
    } else if (config.subject.id === '__filtered__') {
      // no change
    } else if (
      thisPrivilegeCache?.has(config.subject.id) ||
      thisPrivilegeCache?.has(String(config.subject.id)) ||
      thisPrivilegeCache?.has(Number(config.subject.id))
    ) {
      // no change
    } else {
      isAuthorized = false;
    }
  });
  return isAuthorized;
};

export type AuthorizeComponentProps<
  PrivilegeType extends BasePrivilege | TenantBasePrivilege | TenantSbePrivilege
> = {
  children?: ReactElement;
  config: undefined | AuthorizeConfig<PrivilegeType> | AuthorizeConfig<PrivilegeType>[];
};

export const usePrivilegeCacheForConfig = <
  PrivilegeType extends BasePrivilege | TenantBasePrivilege | TenantSbePrivilege
>(
  config: undefined | AuthorizeConfig<PrivilegeType> | AuthorizeConfig<PrivilegeType>[]
) => {
  const configArray = Array.isArray(config) ? config : config === undefined ? [] : [config];
  return usePrivilegeCache(
    configArray.map((config) => ({
      privilege: config.privilege,
      tenantId: 'tenantId' in config.subject ? config.subject.tenantId : undefined,
      sbeId: 'sbeId' in config.subject ? config.subject.sbeId : undefined,
    }))
  );
};

export const AuthorizeComponent = <PrivilegeType extends PrivilegeCode>(
  props: AuthorizeComponentProps<PrivilegeType>
) => {
  usePrivilegeCacheForConfig(props.config);
  const queryClient = useQueryClient();

  if (authorize({ queryClient, config: props.config })) {
    return props.children ?? null;
  } else {
    return null;
  }
};
