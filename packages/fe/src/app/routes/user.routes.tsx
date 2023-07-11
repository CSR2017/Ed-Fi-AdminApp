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
  query: UseQueryResult<Record<string | number, GetUserDto>, unknown>;
}) => {
  const user = getEntityFromQuery(props.id, props.query);
  const params = useParams() as { asId?: string };
  return user ? (
    <Link as="span">
      <RouterLink
        title="Go to user"
        to={(params.asId ? `/as/${params.asId}` : '') + `/users/${user.id}`}
      >
        {getRelationDisplayName(user.id, props.query)}
      </RouterLink>
    </Link>
  ) : typeof props.id === 'number' ? (
    <Text title="User may have been deleted." as="i" color="gray.500">
      not found
    </Text>
  ) : null;
};
