import { Link, Text } from '@chakra-ui/react';
import { GetSbeDto } from '@edanalytics/models';
import { UseQueryResult } from '@tanstack/react-query';
import { RouteObject, useParams, Link as RouterLink } from 'react-router-dom';
import { SbeGlobalPage } from '../Pages/SbeGlobal/SbeGlobalPage';
import { SbesGlobalPage } from '../Pages/SbeGlobal/SbesGlobalPage';
import { sbeQueries } from '../api';
import { getRelationDisplayName } from '../helpers';
import { getEntityFromQuery } from '../helpers/getEntityFromQuery';
import { CreateSbeGlobalPage } from '../Pages/SbeGlobal/CreateSbeGlobalPage';

const SbeGlobalBreadcrumb = () => {
  const params = useParams() as { sbeId: string };
  const sbe = sbeQueries.useOne({ id: params.sbeId });
  return sbe.data?.displayName ?? params.sbeId;
};

export const sbeGlobalCreateRoute: RouteObject = {
  path: '/sbes/create',
  element: <CreateSbeGlobalPage />,
};
export const sbeGlobalIndexRoute: RouteObject = {
  path: '/sbes/:sbeId/',
  element: <SbeGlobalPage />,
};
export const sbeGlobalRoute: RouteObject = {
  path: '/sbes/:sbeId',
  handle: { crumb: SbeGlobalBreadcrumb },
};
export const sbesGlobalIndexRoute: RouteObject = {
  path: '/sbes/',
  element: <SbesGlobalPage />,
};
export const sbesGlobalRoute: RouteObject = {
  path: '/sbes',
  handle: { crumb: () => 'Environments' },
};

export const SbeGlobalLink = (props: {
  id: number | undefined;
  query: UseQueryResult<Record<string | number, GetSbeDto>, unknown>;
}) => {
  const sbe = getEntityFromQuery(props.id, props.query);
  return sbe ? (
    <Link as="span">
      <RouterLink title="Go to sbe" to={`/sbes/${sbe.id}`}>
        {getRelationDisplayName(sbe.id, props.query)}
      </RouterLink>
    </Link>
  ) : typeof props.id === 'number' ? (
    <Text title="Sbe may have been deleted." as="i" color="gray.500">
      not found
    </Text>
  ) : null;
};
