import { Link, Text } from '@chakra-ui/react';
import { GetUserDto } from '@edanalytics/models';
import { UseQueryResult } from '@tanstack/react-query';
import { RouteObject, Link as RouterLink, useParams } from 'react-router-dom';
import { CreateUser } from '../Pages/UserGlobal/CreateUserGlobalPage';
import { UserGlobalPage } from '../Pages/UserGlobal/UserGlobalPage';
import { UsersGlobalPage } from '../Pages/UserGlobal/UsersGlobalPage';
import { userQueries } from '../api';
import { getRelationDisplayName } from '../helpers';
import { getEntityFromQuery } from '../helpers/getEntityFromQuery';

const UserGlobalBreadcrumb = () => {
  const params = useParams() as { userId: string; asId: string };
  const user = userQueries.useOne({
    id: params.userId,
    tenantId: params.asId,
  });
  return user.data?.displayName ?? params.userId;
};

export const userGlobalCreateRoute: RouteObject = {
  path: '/users/create',
  handle: { crumb: () => 'Create' },
  element: <CreateUser />,
};
export const userGlobalIndexRoute: RouteObject = {
  path: '/users/:userId/',
  element: <UserGlobalPage />,
};
export const userGlobalRoute: RouteObject = {
  path: '/users/:userId',
  handle: { crumb: UserGlobalBreadcrumb },
};

export const usersGlobalIndexRoute: RouteObject = {
  path: '/users/',
  element: <UsersGlobalPage />,
};
export const usersGlobalRoute: RouteObject = {
  path: '/users',
  handle: { crumb: () => 'Users' },
};

export const UserGlobalLink = (props: {
  id: number | undefined;
  /**@deprecated unneeded and no longer used. */
  query?: UseQueryResult<Record<string | number, GetUserDto>, unknown>;
}) => {
  const params = useParams() as { asId: string };

  const users = userQueries.useAll({ tenantId: params.asId });
  const user = getEntityFromQuery(props.id, users);
  return user ? (
    <Link as="span">
      <RouterLink title="Go to user" to={`/users/${user.id}`}>
        {getRelationDisplayName(user.id, users)}
      </RouterLink>
    </Link>
  ) : typeof props.id === 'number' ? (
    <Text title="User may have been deleted." as="i" color="gray.500">
      not found
    </Text>
  ) : null;
};
