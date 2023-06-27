import {
  FormLabel,
  Grid,
  SimpleGrid,
  Tag,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { useParams } from '@tanstack/router';
import { roleQueries } from '../../api';
import { roleRoute } from '../../routes';

export const ViewRole = () => {
  const params = useParams({ from: roleRoute.id });
  const role = roleQueries.useOne({
    id: params.roleId,
    tenantId: params.asId,
  }).data;

  return role ? (
    <>
      <FormLabel as="p">Description</FormLabel>
      <Text>{role.description ?? '-'}</Text>
      <FormLabel as="p">Type</FormLabel>
      <Text>{role.type ?? '-'}</Text>
      <FormLabel as="p">Privileges</FormLabel>
      <Grid gap={2} templateColumns="repeat(4, auto)" w="fit-content">
        {role.privileges?.map((p) => (
          <Tag key={p.code} colorScheme="orange" display="flex" w="max-content">
            {p.code}
          </Tag>
        ))}
      </Grid>
    </>
  ) : null;
};
