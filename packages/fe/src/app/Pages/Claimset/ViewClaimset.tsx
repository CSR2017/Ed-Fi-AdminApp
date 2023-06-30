import { FormLabel, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { claimsetQueries } from '../../api';

export const ViewClaimset = () => {
  const params = useParams() as {
    asId: string;
    sbeId: string;
    claimsetId: string;
  };
  const claimset = claimsetQueries.useOne({
    id: params.claimsetId,
    sbeId: params.sbeId,
    tenantId: params.asId,
  }).data;

  return claimset ? (
    <>
      <FormLabel as="p">Is reserved</FormLabel>
      <Text>{String(claimset.isSystemReserved ?? false)}</Text>
      <FormLabel as="p">Applications</FormLabel>
      <Text>{claimset.applicationsCount}</Text>
    </>
  ) : null;
};
