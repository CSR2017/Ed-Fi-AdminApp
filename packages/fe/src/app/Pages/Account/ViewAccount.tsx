import { FormLabel, Grid, SimpleGrid, Tag, Text } from '@chakra-ui/react';
import { useMe } from '../../api';

export const ViewAccount = () => {
  const me = useMe();
  const user = me.data;

  return user ? (
    <>
      <FormLabel as="p">Username</FormLabel>
      <Text>{user.username}</Text>
      <FormLabel as="p">Global role</FormLabel>
      <Text>{user.role?.displayName}</Text>
      <FormLabel as="p">Privileges</FormLabel>
      <SimpleGrid columns={2}>
        {user?.role.privileges?.map((p) => (
          <Tag
            key={p.code}
            colorScheme="orange"
            display="flex"
            w="max-content"
            mb={2}
          >
            {p.code}
          </Tag>
        ))}
      </SimpleGrid>
    </>
  ) : null;
};
