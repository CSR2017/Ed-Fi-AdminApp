import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  FormLabel,
  Grid,
  HStack,
  Heading,
  Link,
  ListItem,
  SimpleGrid,
  Tag,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useMe, useMyTenants } from '../../api';
import _ from 'lodash';

export const ViewAccount = () => {
  const me = useMe();
  const user = me.data;
  const utmArr = user?.userTenantMemberships ?? [];

  return user ? (
    <>
      <FormLabel as="p">Username</FormLabel>
      <Text>{user.username}</Text>
      <FormLabel as="p">User role</FormLabel>
      <Text>{user.role?.displayName}</Text>
      {utmArr.length > 1 ? (
        <>
          <FormLabel as="p">Tenants</FormLabel>
          <UnorderedList>
            {utmArr.map((t) => (
              <ListItem key={t.id}>
                <Link as={RouterLink} to={`/as/${t.tenant.id}`}>
                  {t.tenant.displayName}
                </Link>
              </ListItem>
            ))}
          </UnorderedList>
        </>
      ) : utmArr.length > 0 ? (
        <>
          <FormLabel as="p">Tenant</FormLabel>
          <Text>{utmArr[0].tenant.displayName}</Text>
        </>
      ) : null}
    </>
  ) : null;
};
