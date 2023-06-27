import { Link, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink, Route, useParams } from '@tanstack/router';
import { UseQueryResult } from '@tanstack/react-query';
import { GetOwnershipDto } from '@edanalytics/models';
import { mainLayoutRoute } from '.';
import { getRelationDisplayName } from '../helpers';
import { ownershipQueries } from '../api';
import { getEntityFromQuery } from '../helpers/getEntityFromQuery';
import { OwnershipGlobalPage } from '../Pages/OwnershipGlobal/OwnershipGlobalPage';
import { OwnershipsGlobalPage } from '../Pages/OwnershipGlobal/OwnershipsGlobalPage';
import { CreateOwnershipGlobalPage } from '../Pages/OwnershipGlobal/CreateOwnershipGlobalPage';

export const ownershipsGlobalRoute = new Route({
  getParentRoute: () => mainLayoutRoute,
  path: 'ownerships',
  getContext: ({ params }) => ({
    breadcrumb: () => ({ title: () => 'Ownerships', params }),
  }),
});

export const ownershipsGlobalIndexRoute = new Route({
  getParentRoute: () => ownershipsGlobalRoute,
  path: '/',
  component: OwnershipsGlobalPage,
});

const OwnershipGlobalBreadcrumb = () => {
  const params = useParams({ from: ownershipGlobalRoute.id });
  const ownership = ownershipQueries.useOne({ id: params.ownershipId });
  return ownership.data?.displayName ?? params.ownershipId;
};

export const ownershipGlobalRoute = new Route({
  getParentRoute: () => ownershipsGlobalRoute,
  path: '$ownershipId',
  validateSearch: (search): { edit?: boolean } =>
    typeof search.edit === 'boolean' ? { edit: search.edit } : {},
  getContext: ({ params }) => {
    return {
      breadcrumb: () => ({ title: OwnershipGlobalBreadcrumb, params }),
    };
  },
});

export const ownershipGlobalCreateRoute = new Route({
  getParentRoute: () => ownershipsGlobalRoute,
  path: 'create',
  validateSearch: (
    search
  ): Partial<{
    type: 'edorg' | 'ods' | 'sbe';
    sbeId: number;
    odsId: number;
    edorgId: number;
    tenantId: number;
    roleId: number;
  }> => search,
  getContext: ({ params }) => {
    return {
      breadcrumb: () => ({ title: () => 'Create', params }),
    };
  },
  component: CreateOwnershipGlobalPage,
});

export const ownershipGlobalIndexRoute = new Route({
  getParentRoute: () => ownershipGlobalRoute,
  path: '/',
  component: OwnershipGlobalPage,
});

export const OwnershipGlobalLink = (props: {
  id: number | undefined;
  query: UseQueryResult<Record<string | number, GetOwnershipDto>, unknown>;
}) => {
  const ownership = getEntityFromQuery(props.id, props.query);
  return ownership ? (
    <Link as="span">
      <RouterLink
        title="Go to ownership"
        to={ownershipGlobalRoute.fullPath}
        params={{
          ownershipId: String(ownership.id),
        }}
      >
        {getRelationDisplayName(ownership.id, props.query)}
      </RouterLink>
    </Link>
  ) : typeof props.id === 'number' ? (
    <Text title="Ownership may have been deleted." as="i" color="gray.500">
      not found
    </Text>
  ) : null;
};
