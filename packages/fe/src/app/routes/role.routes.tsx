import { Link, Text } from '@chakra-ui/react';
import { GetRoleDto } from '@edanalytics/models';
import { UseQueryResult } from '@tanstack/react-query';
import { RouteObject, Link as RouterLink, useParams } from 'react-router-dom';
import { RolePage } from '../Pages/Role/RolePage';
import { RolesPage } from '../Pages/Role/RolesPage';
import { roleQueries } from '../api';
import { getRelationDisplayName } from '../helpers';
import { getEntityFromQuery } from '../helpers/getEntityFromQuery';

const RoleBreadcrumb = () => {
  const params = useParams() as { roleId: string; asId: string };
  const role = roleQueries.useOne({
    id: params.roleId,
    tenantId: params.asId,
  });
  return role.data?.displayName ?? params.roleId;
};

export const roleIndexRoute: RouteObject = {
  path: '/as/:asId/roles/:roleId/',
  element: <RolePage />,
};
export const roleRoute: RouteObject = {
  path: '/as/:asId/roles/:roleId',
  handle: { crumb: RoleBreadcrumb },
};
export const rolesIndexRoute: RouteObject = {
  path: '/as/:asId/roles/',
  element: <RolesPage />,
};
export const rolesRoute: RouteObject = {
  path: '/as/:asId/roles',
  handle: { crumb: () => 'Roles' },
};

export const RoleLink = (props: {
  id: number | undefined;
  query: UseQueryResult<Record<string | number, GetRoleDto>, unknown>;
}) => {
  const role = getEntityFromQuery(props.id, props.query);
  const params = useParams() as { asId: string };
  return role ? (
    <Link as="span">
      <RouterLink title="Go to role" to={`/as/${params.asId}/roles/${role.id}`}>
        {getRelationDisplayName(role.id, props.query)}
      </RouterLink>
    </Link>
  ) : typeof props.id === 'number' ? (
    <Text title="Role may have been deleted." as="i" color="gray.500">
      not found
    </Text>
  ) : null;
};
