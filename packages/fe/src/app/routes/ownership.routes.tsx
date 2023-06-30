import { Link, Text } from '@chakra-ui/react';
import { GetOwnershipDto } from '@edanalytics/models';
import { UseQueryResult } from '@tanstack/react-query';
import { RouteObject, Link as RouterLink, useParams } from 'react-router-dom';
import { OwnershipPage } from '../Pages/Ownership/OwnershipPage';
import { OwnershipsPage } from '../Pages/Ownership/OwnershipsPage';
import { ownershipQueries } from '../api';
import { getRelationDisplayName } from '../helpers';
import { getEntityFromQuery } from '../helpers/getEntityFromQuery';

const OwnershipBreadcrumb = () => {
  const params = useParams() as { ownershipId: string; asId: string };
  const ownership = ownershipQueries.useOne({
    id: params.ownershipId,
    tenantId: params.asId,
  });
  return ownership.data?.displayName ?? params.ownershipId;
};

export const ownershipIndexRoute: RouteObject = {
  path: '/as/:asId/ownerships/:ownershipId/',
  element: <OwnershipPage />,
};
export const ownershipRoute: RouteObject = {
  path: '/as/:asId/ownerships/:ownershipId',
  handle: { crumb: OwnershipBreadcrumb },
};

export const ownershipsIndexRoute: RouteObject = {
  path: '/as/:asId/ownerships/',
  element: <OwnershipsPage />,
};
export const ownershipsRoute: RouteObject = {
  path: '/as/:asId/ownerships',
  handle: { crumb: () => 'Ownerships' },
};

export const OwnershipLink = (props: {
  id: number | undefined;
  query: UseQueryResult<Record<string | number, GetOwnershipDto>, unknown>;
}) => {
  const ownership = getEntityFromQuery(props.id, props.query);
  const params = useParams() as { asId: string };
  return ownership ? (
    <Link as="span">
      <RouterLink
        title="Go to ownership"
        to={`/as/${params.asId}/ownerships/${ownership.id}`}
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
