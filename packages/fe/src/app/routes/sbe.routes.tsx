import { Link, Text } from '@chakra-ui/react';
import { GetSbeDto } from '@edanalytics/models';
import { UseQueryResult } from '@tanstack/react-query';
import { RouteObject, Link as RouterLink, useParams } from 'react-router-dom';
import { SbePage } from '../Pages/Sbe/SbePage';
import { SbesPage } from '../Pages/Sbe/SbesPage';
import { sbeQueries } from '../api';
import { getRelationDisplayName } from '../helpers';
import { getEntityFromQuery } from '../helpers/getEntityFromQuery';

const SbeBreadcrumb = () => {
  const params = useParams() as { sbeId: string; asId: string };
  const sbe = sbeQueries.useOne({
    id: params.sbeId,
    tenantId: params.asId,
  });
  return sbe.data?.displayName ?? params.sbeId;
};

export const sbeIndexRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId/',
  element: <SbePage />,
};
export const sbeRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId',
  handle: { crumb: SbeBreadcrumb },
};

export const sbesIndexRoute: RouteObject = {
  path: '/as/:asId/sbes/',
  element: <SbesPage />,
};
export const sbesRoute: RouteObject = {
  path: '/as/:asId/sbes',
  handle: { crumb: () => 'Environments' },
};

export const SbeLink = (props: {
  id: number | undefined;
  query: UseQueryResult<Record<string | number, GetSbeDto>, unknown>;
}) => {
  const sbe = getEntityFromQuery(props.id, props.query);
  const params = useParams() as { asId: string };
  return sbe ? (
    <Link as="span">
      <RouterLink title="Go to sbe" to={`/as/${params.asId}/sbes/${sbe.id}`}>
        {getRelationDisplayName(sbe.id, props.query)}
      </RouterLink>
    </Link>
  ) : typeof props.id === 'number' ? (
    <Text title="Sbe may have been deleted." as="i" color="gray.500">
      not found
    </Text>
  ) : null;
};
