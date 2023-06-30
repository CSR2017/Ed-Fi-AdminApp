import { FormLabel, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { userQueries } from '../../api';

export const ViewUser = () => {
  const params = useParams() as {
    asId: string;
    userId: string;
  };
  const user = userQueries.useOne({
    id: params.userId,
    tenantId: params.asId,
  }).data;

  return user ? (
    <>
      <FormLabel as="p">Given Name</FormLabel>
      <Text color="gray.600">{user.givenName}</Text>
      <FormLabel as="p">Family Name</FormLabel>
      <Text color="gray.600">{user.familyName}</Text>
    </>
  ) : null;
};
