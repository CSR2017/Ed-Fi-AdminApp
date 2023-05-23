import { Text } from '@chakra-ui/react';
import { useMe } from '../../api';

export const ViewAccount = () => {
  const me = useMe();
  const user = me.data;

  return user ? (
    <>
      {/* TODO: replace this with real content */}
      <Text as="strong">Id</Text>
      <Text>{user.id}</Text>
    </>
  ) : null;
};
