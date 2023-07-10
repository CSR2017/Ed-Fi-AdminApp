import { Flex, FormLabel, Grid, SimpleGrid, Tag, Text } from '@chakra-ui/react';
import { useMe } from '../../api';
import _ from 'lodash';

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
      <Grid gap={2} templateColumns="repeat(4, auto)" w="fit-content">
        {_.orderBy(user?.role.privileges ?? [], [(p) => p.code], ['asc']).map((p) => (
          <Tag
            key={p.code}
            colorScheme="orange"
            display="flex"
            w="max-content"
            whiteSpace={'nowrap'}
          >
            {p.code}
          </Tag>
        ))}
      </Grid>
    </>
  ) : null;
};
