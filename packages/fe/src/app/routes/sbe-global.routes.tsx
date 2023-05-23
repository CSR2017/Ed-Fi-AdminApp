import { Link, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink, Route, useParams } from '@tanstack/router';
import { UseQueryResult } from '@tanstack/react-query';
import { GetSbeDto } from '@edanalytics/models';
import { mainLayoutRoute } from '.';
import { getRelationDisplayName } from '../helpers';
import { sbeQueries } from '../api';
import { getEntityFromQuery } from '../helpers/getEntityFromQuery';
import { SbesGlobalPage } from '../Pages/SbeGlobal/SbesGlobalPage';
import { SbeGlobalPage } from '../Pages/SbeGlobal/SbeGlobalPage';

export const sbesGlobalRoute = new Route({
  getParentRoute: () => mainLayoutRoute,
  path: 'sbes',
  getContext: ({ params }) => ({
    breadcrumb: () => ({ title: () => 'Sbes', params }),
  }),
});

export const sbesGlobalIndexRoute = new Route({
  getParentRoute: () => sbesGlobalRoute,
  path: '/',
  component: SbesGlobalPage,
});

const SbeGlobalBreadcrumb = () => {
  const params = useParams({ from: sbeGlobalRoute.id });
  const sbe = sbeQueries.useOne({ id: params.sbeId });
  return sbe.data?.displayName ?? params.sbeId;
};

export const sbeGlobalRoute = new Route({
  getParentRoute: () => sbesGlobalRoute,
  path: '$sbeId',
  validateSearch: (search): { edit?: boolean } =>
    typeof search.edit === 'boolean' ? { edit: search.edit } : {},
  getContext: ({ params }) => {
    return {
      breadcrumb: () => ({ title: SbeGlobalBreadcrumb, params }),
    };
  },
});

export const sbeGlobalIndexRoute = new Route({
  getParentRoute: () => sbeGlobalRoute,
  path: '/',
  component: SbeGlobalPage,
});

export const SbeGlobalLink = (props: {
  id: number | undefined;
  query: UseQueryResult<Record<string | number, GetSbeDto>, unknown>;
}) => {
  const sbe = getEntityFromQuery(props.id, props.query);
  return sbe ? (
    <Link as="span">
      <RouterLink
        title="Go to sbe"
        to={sbeGlobalRoute.fullPath}
        params={{
          sbeId: String(sbe.id),
        }}
      >
        {getRelationDisplayName(sbe.id, props.query)}
      </RouterLink>
    </Link>
  ) : typeof props.id === 'number' ? (
    <Text title="Sbe may have been deleted." as="i" color="gray.500">
      not found
    </Text>
  ) : null;
};
