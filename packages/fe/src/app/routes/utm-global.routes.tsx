import { Link, Text } from '@chakra-ui/react';
import { GetUserTenantMembershipDto } from '@edanalytics/models';
import { UseQueryResult } from '@tanstack/react-query';
import { RouteObject, Link as RouterLink, useParams } from 'react-router-dom';
import { CreateUtmGlobal } from '../Pages/UserTenantMembershipGlobal/CreateUtmGlobal';
import { UtmGlobalPage } from '../Pages/UserTenantMembershipGlobal/UtmPageGlobal';
import { UtmsGlobalPage } from '../Pages/UserTenantMembershipGlobal/UtmsPageGlobal';
import { userTenantMembershipQueries } from '../api';
import { getRelationDisplayName } from '../helpers';
import { getEntityFromQuery } from '../helpers/getEntityFromQuery';

const UtmGlobalBreadcrumb = () => {
  const params = useParams() as { userTenantMembershipId: string };
  const utm = userTenantMembershipQueries.useOne({ id: params.userTenantMembershipId });
  return utm.data?.displayName ?? params.userTenantMembershipId;
};

export const utmGlobalCreateRoute: RouteObject = {
  path: '/user-tenant-memberships/create',
  handle: { crumb: () => 'Create' },
  element: <CreateUtmGlobal />,
};
export const utmGlobalIndexRoute: RouteObject = {
  path: '/user-tenant-memberships/:userTenantMembershipId/',
  element: <UtmGlobalPage />,
};
export const utmGlobalRoute: RouteObject = {
  path: '/user-tenant-memberships/:userTenantMembershipId',
  handle: { crumb: UtmGlobalBreadcrumb },
};
export const utmsGlobalIndexRoute: RouteObject = {
  path: '/user-tenant-memberships/',
  element: <UtmsGlobalPage />,
};
export const utmsGlobalRoute: RouteObject = {
  path: '/user-tenant-memberships',
  handle: { crumb: () => 'Tenant memberships' },
};

export const UtmGlobalLink = (props: {
  id: number | undefined;
  query: UseQueryResult<Record<string | number, GetUserTenantMembershipDto>, unknown>;
}) => {
  const utm = getEntityFromQuery(props.id, props.query);
  return utm ? (
    <Link as="span">
      <RouterLink title="Go to tenant membership" to={`/user-tenant-memberships/${utm.id}`}>
        {getRelationDisplayName(utm.id, props.query)}
      </RouterLink>
    </Link>
  ) : typeof props.id === 'number' ? (
    <Text title="Tenant membership may have been deleted." as="i" color="gray.500">
      not found
    </Text>
  ) : null;
};
