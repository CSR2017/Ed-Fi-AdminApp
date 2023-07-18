import { Link, Text } from '@chakra-ui/react';
import { GetUserDto } from '@edanalytics/models';
import { UseQueryResult } from '@tanstack/react-query';
import { RouteObject, Link as RouterLink, useParams } from 'react-router-dom';
import { UserPage } from '../Pages/User/UserPage';
import { UsersPage } from '../Pages/User/UsersPage';
import { userQueries } from '../api';
import { getRelationDisplayName } from '../helpers';
import { getEntityFromQuery } from '../helpers/getEntityFromQuery';

const UserBreadcrumb = () => {
  const params = useParams() as { userId: string; asId: string };
  const user = userQueries.useOne({
    id: params.userId,
    tenantId: params.asId,
  });
  return user.data?.displayName ?? params.userId;
};

export const userIndexRoute: RouteObject = {
  path: '/as/:asId/users/:userId/',
  element: <UserPage />,
};
export const userRoute: RouteObject = {
  path: '/as/:asId/users/:userId',
  handle: { crumb: UserBreadcrumb },
};

export const usersIndexRoute: RouteObject = {
  path: '/as/:asId/users/',
  element: <UsersPage />,
};
export const usersRoute: RouteObject = {
  path: '/as/:asId/users',
  handle: { crumb: () => 'Users' },
};

export const UserLink = (props: {
  id: number | undefined;
  /**@deprecated unneeded and no longer used. */
  query?: UseQueryResult<Record<string | number, GetUserDto>, unknown>;
}) => {
  const params = useParams() as { asId: string };

  const users = userQueries.useAll({ tenantId: params.asId });
  const user = getEntityFromQuery(props.id, users);
  return user ? (
    <Link as="span">
      <RouterLink
        title="Go to user"
        to={(params.asId ? `/as/${params.asId}` : '') + `/users/${user.id}`}
      >
        {getRelationDisplayName(user.id, users)}
      </RouterLink>
    </Link>
  ) : typeof props.id === 'number' ? (
    <Text title="User may have been deleted." as="i" color="gray.500">
      not found
    </Text>
  ) : null;
};
