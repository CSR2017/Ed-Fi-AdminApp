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
  Text,
} from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { RxCaretDown } from 'react-icons/rx';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import logoUrl from '../../assets/starting-blocks.svg';
import { apiClient, useMe, useMyTenants } from '../api';
import { asTenantIdAtom } from './Nav';

export const AppBar = () => {
  const me = useMe();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const asId = useAtomValue(asTenantIdAtom);
  const tenants = useMyTenants();
  const tenant = asId === undefined ? undefined : tenants.data?.[asId];

  return (
    <HStack
      zIndex={2}
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
      <HStack>
        <RouterLink to={asId ? `/as/${asId}` : '/'}>
          <Image h={7} src={logoUrl} />
        </RouterLink>
        <Text
          lineHeight="1.7"
          borderLeft="2px solid"
          borderColor="gray.300"
          ml="0.9ch"
          pl="1.5ch"
          fontWeight="medium"
          fontSize="lg"
          color="gray.500"
        >
          {tenant?.displayName ?? 'Global scope'}
        </Text>
      </HStack>
      <Menu>
        <MenuButton as={Button} variant="unstyled">
          <HStack spacing={0}>
            <Avatar name={me.data?.fullName} size="sm" />
            <Icon as={RxCaretDown} />
          </HStack>
        </MenuButton>
        <MenuList>
          <MenuItem
            onClick={() => {
              navigate('/public');
              apiClient.post('/auth/logout', {}).then(() => {
                queryClient.invalidateQueries({ queryKey: ['me'] });
              });
            }}
          >
            Sign out
          </MenuItem>
          {me.data?.role ? (
            <MenuItem to="/account" as={RouterLink}>
              My profile
            </MenuItem>
          ) : null}
        </MenuList>
      </Menu>
    </HStack>
  );
};
