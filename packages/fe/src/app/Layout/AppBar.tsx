import {
  Avatar,
  Button,
  HStack,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { RxCaretDown } from 'react-icons/rx';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import logoUrl from '../../assets/starting-blocks.svg';
import { apiClient, useMe } from '../api';

export const AppBar = () => {
  const me = useMe();

  const navigate = useNavigate();

  return (
    <HStack
      as="header"
      justify="space-between"
      w="100%"
      position="sticky"
      top="0px"
      bg="rgb(248,248,248)"
      borderBottom="1px solid"
      borderColor="gray.200"
      py={1}
      px={3}
    >
      <RouterLink to="/">
        <Image h={7} src={logoUrl} />
      </RouterLink>
      <Menu>
        <MenuButton as={Button} variant="unstyled">
          <HStack spacing={0}>
            <Avatar name={me.data?.fullName || ''} size="sm" />
            <Icon as={RxCaretDown} />
          </HStack>
        </MenuButton>
        <MenuList>
          <MenuItem
            onClick={() => {
              apiClient.post('/auth/logout', {}).then(() => {
                navigate('/public');
              });
            }}
          >
            Sign out
          </MenuItem>
          <MenuItem to="/me" as={RouterLink}>
            My profile
          </MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  );
};
