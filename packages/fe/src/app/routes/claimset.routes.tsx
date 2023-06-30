import { Link, Text } from '@chakra-ui/react';
import { GetClaimsetDto } from '@edanalytics/models';
import { UseQueryResult } from '@tanstack/react-query';
import { RouteObject, Link as RouterLink, useParams } from 'react-router-dom';
import { ClaimsetPage } from '../Pages/Claimset/ClaimsetPage';
import { ClaimsetsPage } from '../Pages/Claimset/ClaimsetsPage';
import { claimsetQueries } from '../api';
import { getRelationDisplayName } from '../helpers';
import { getEntityFromQuery } from '../helpers/getEntityFromQuery';

const ClaimsetBreadcrumb = () => {
  const params = useParams() as {
    claimsetId: string;
    asId: string;
    sbeId: string;
  };
  const claimset = claimsetQueries.useOne({
    id: params.claimsetId,
    tenantId: params.asId,
    sbeId: params.sbeId,
  });
  return claimset.data?.displayName ?? params.claimsetId;
};
export const claimsetIndexRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId/claimsets/:claimsetId/',
  element: <ClaimsetPage />,
};

export const claimsetRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId/claimsets/:claimsetId',
  handle: { crumb: ClaimsetBreadcrumb },
};
export const claimsetsIndexRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId/claimsets/',
  element: <ClaimsetsPage />,
};
export const claimsetsRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId/claimsets',
  handle: { crumb: () => 'Claimsets' },
};

export const ClaimsetLink = (props: {
  id: number | undefined;
  query: UseQueryResult<Record<string | number, GetClaimsetDto>, unknown>;
}) => {
  const claimset = getEntityFromQuery(props.id, props.query);
  const params = useParams() as {
    asId: string;
    sbeId: string;
  };
  return claimset ? (
    <Link as="span">
      <RouterLink
        title="Go to claimset"
        to={`/as/${params.asId}/sbes/${params.sbeId}/claimsets/${claimset.id}`}
      >
        {getRelationDisplayName(claimset.id, props.query)}
      </RouterLink>
    </Link>
  ) : typeof props.id === 'number' ? (
    <Text title="Claimset may have been deleted." as="i" color="gray.500">
      not found
    </Text>
  ) : null;
};
