import { Link, Text } from '@chakra-ui/react';
import { GetOdsDto } from '@edanalytics/models';
import { UseQueryResult } from '@tanstack/react-query';
import { RouteObject, Link as RouterLink, useParams } from 'react-router-dom';
import { OdsPage } from '../Pages/Ods/OdsPage';
import { OdssPage } from '../Pages/Ods/OdssPage';
import { odsQueries } from '../api';
import { getRelationDisplayName } from '../helpers';
import { getEntityFromQuery } from '../helpers/getEntityFromQuery';

const OdsBreadcrumb = () => {
  const params = useParams() as { odsId: string; asId: string; sbeId: string };
  const ods = odsQueries.useOne({
    id: params.odsId,
    tenantId: params.asId,
    sbeId: params.sbeId,
  });
  return ods.data?.displayName ?? params.odsId;
};
export const odsIndexRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId/odss/:odsId/',
  element: <OdsPage />,
};

export const odsRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId/odss/:odsId',
  handle: { crumb: OdsBreadcrumb },
};
export const odssIndexRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId/odss/',
  element: <OdssPage />,
};
export const odssRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId/odss',
  handle: { crumb: () => "ODS's" },
};

export const OdsLink = (props: {
  id: number | undefined;
  query: UseQueryResult<Record<string | number, GetOdsDto>, unknown>;
}) => {
  const ods = getEntityFromQuery(props.id, props.query);
  const params = useParams() as { asId: string; sbeId: string };
  return ods ? (
    <Link as="span">
      <RouterLink title="Go to ods" to={`/as/${params.asId}/sbes/${ods.sbeId}/odss/${ods.id}`}>
        {getRelationDisplayName(ods.id, props.query)}
      </RouterLink>
    </Link>
  ) : typeof props.id === 'number' ? (
    <Text title="Ods may have been deleted." as="i" color="gray.500">
      not found
    </Text>
  ) : null;
};
