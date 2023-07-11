import { FormLabel, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { tenantQueries } from '../../api';

export const ViewTenant = () => {
  const params = useParams() as { tenantId: string };
  const tenant = tenantQueries.useOne({
    id: params.tenantId,
  }).data;

  return tenant ? (
    <>
      <FormLabel as="p">Name</FormLabel>
      <Text>{tenant.name}</Text>
    </>
  ) : null;
};
