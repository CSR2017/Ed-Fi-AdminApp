import { FormLabel, Tag, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { roleQueries, userQueries } from '../../api';
import { RoleGlobalLink } from '../../routes/role-global.routes';

export const ViewUserGlobal = () => {
  const params = useParams() as {
    userId: string;
  };
  const user = userQueries.useOne({
    id: params.userId,
  }).data;
  const roles = roleQueries.useAll({});

  return user ? (
    <>
      <FormLabel as="p">Username</FormLabel>
      <Text>{user.username}</Text>
      <FormLabel as="p">Given name</FormLabel>
      <Text>{user.givenName}</Text>
      <FormLabel as="p">Family name</FormLabel>
      <Text>{user.familyName}</Text>
      <FormLabel as="p">Status</FormLabel>
      {user.isActive ? (
        <Tag colorScheme="green">Active</Tag>
      ) : (
        <Tag colorScheme="orange">Inactive</Tag>
      )}
      <FormLabel as="p">Role</FormLabel>
      <RoleGlobalLink id={user.roleId} query={roles} />
    </>
  ) : null;
};
