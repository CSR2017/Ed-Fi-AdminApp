import { Link, Text } from '@chakra-ui/react';
import { GetEdorgDto } from '@edanalytics/models';
import { UseQueryResult } from '@tanstack/react-query';
import { RouteObject, Link as RouterLink, useParams } from 'react-router-dom';
import { EdorgPage } from '../Pages/Edorg/EdorgPage';
import { EdorgsPage } from '../Pages/Edorg/EdorgsPage';
import { edorgQueries } from '../api';
import { getRelationDisplayName } from '../helpers';
import { getEntityFromQuery } from '../helpers/getEntityFromQuery';

const EdorgBreadcrumb = () => {
  const params = useParams() as {
    edorgId: string;
    asId: string;
    sbeId: string;
  };
  const edorg = edorgQueries.useOne({
    id: params.edorgId,
    tenantId: params.asId,
    sbeId: params.sbeId,
  });
  return edorg.data?.displayName ?? params.edorgId;
};
export const edorgIndexRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId/edorgs/:edorgId/',
  element: <EdorgPage />,
};

export const edorgRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId/edorgs/:edorgId',
  handle: { crumb: EdorgBreadcrumb },
};
export const edorgsIndexRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId/edorgs/',
  element: <EdorgsPage />,
};
export const edorgsRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId/edorgs',
  handle: { crumb: () => 'Ed-Orgs' },
};

export const EdorgLink = (props: {
  id: number | undefined;
  query: UseQueryResult<Record<string | number, GetEdorgDto>, unknown>;
}) => {
  const edorg = getEntityFromQuery(props.id, props.query);
  const params = useParams() as {
    asId: string;
    sbeId: string;
  };
  return edorg ? (
    <Link as="span">
      <RouterLink
        title="Go to edorg"
        to={`/as/${params.asId}/sbes/${edorg.sbeId}/edorgs/${edorg.id}`}
      >
        {getRelationDisplayName(edorg.id, props.query)}
      </RouterLink>
    </Link>
  ) : typeof props.id === 'number' ? (
    <Text title="Edorg may have been deleted." as="i" color="gray.500">
      not found
    </Text>
  ) : null;
};
