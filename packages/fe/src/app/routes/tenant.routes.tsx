import { Link, Text } from '@chakra-ui/react';
import { GetTenantDto } from '@edanalytics/models';
import { UseQueryResult } from '@tanstack/react-query';
import { RouteObject, Link as RouterLink, useParams } from 'react-router-dom';
import { TenantPage } from '../Pages/Tenant/TenantPage';
import { TenantsPage } from '../Pages/Tenant/TenantsPage';
import { tenantQueries } from '../api';
import { getRelationDisplayName } from '../helpers';
import { getEntityFromQuery } from '../helpers/getEntityFromQuery';
import { CreateTenant } from '../Pages/Tenant/CreateTenant';

const TenantBreadcrumb = () => {
  const params = useParams() as { tenantId: string };
  const tenant = tenantQueries.useOne({ id: params.tenantId });
  return tenant.data?.displayName ?? params.tenantId;
};
export const tenantCreateRoute: RouteObject = {
  path: '/tenants/create',
  handle: { crumb: () => 'Create' },
  element: <CreateTenant />,
};

export const tenantIndexRoute: RouteObject = {
  path: '/tenants/:tenantId/',
  element: <TenantPage />,
};
export const tenantRoute: RouteObject = {
  path: '/tenants/:tenantId',
  handle: { crumb: TenantBreadcrumb },
};
export const tenantsIndexRoute: RouteObject = {
  path: '/tenants/',
  element: <TenantsPage />,
};
export const tenantsRoute: RouteObject = {
  path: '/tenants',
  handle: { crumb: () => 'Tenants' },
};

export const TenantLink = (props: {
  id: number | undefined;
  query: UseQueryResult<Record<string | number, GetTenantDto>, unknown>;
}) => {
  const tenant = getEntityFromQuery(props.id, props.query);
  return tenant ? (
    <Link as="span">
      <RouterLink title="Go to tenant" to={`/tenants/${tenant.id}`}>
        {getRelationDisplayName(tenant.id, props.query)}
      </RouterLink>
    </Link>
  ) : typeof props.id === 'number' ? (
    <Text title="Tenant may have been deleted." as="i" color="gray.500">
      not found
    </Text>
  ) : null;
};
