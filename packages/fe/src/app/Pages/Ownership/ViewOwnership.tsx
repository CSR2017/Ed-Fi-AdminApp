import { FormLabel, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { ownershipQueries } from '../../api';

export const ViewOwnership = () => {
  const params = useParams() as {
    asId: string;
    sbeId: string;
    ownershipId: string;
  };
  const ownership = ownershipQueries.useOne({
    id: params.ownershipId,
    tenantId: params.asId,
  }).data;

  return ownership ? (
    <>
      {/* TODO: replace this with real content */}
      <FormLabel as="p">Id</FormLabel>
      <Text>{ownership.id}</Text>
    </>
  ) : null;
};
