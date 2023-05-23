import { FormLabel, Text } from '@chakra-ui/react';
import { useParams } from '@tanstack/router';
import { sbeQueries } from '../../api';
import { sbeGlobalRoute } from '../../routes';

export const ViewSbeGlobal = () => {
  const params = useParams({ from: sbeGlobalRoute.id });
  const sbe = sbeQueries.useOne({
    id: params.sbeId,
  }).data;

  return sbe ? (
    <>
      <FormLabel as="p">Environment label</FormLabel>
      <Text>{sbe.envLabel}</Text>
      <FormLabel as="p">
        Last successful connection to Starting Blocks
      </FormLabel>
      <Text>{sbe.configPublic?.lastSuccessfulConnectionSbMetaLong}</Text>
      <FormLabel as="p">Last failed connection to Starting Blocks</FormLabel>
      <Text>{sbe.configPublic?.lastFailedConnectionSbMetaLong}</Text>
      <FormLabel as="p">
        Last successful connection to Ed-Fi Admin API
      </FormLabel>
      <Text>{sbe.configPublic?.lastSuccessfulConnectionAdminApiLong}</Text>
      <FormLabel as="p">Last failed connection to Ed-Fi Admin API</FormLabel>
      <Text>{sbe.configPublic?.lastFailedConnectionAdminApiLong}</Text>
      <FormLabel as="p">Last successful sync with Starting Blocks</FormLabel>
      <Text>{sbe.configPublic?.lastSuccessfulPullLong}</Text>
      <FormLabel as="p">Last failed sync with Starting Blocks</FormLabel>
      <Text>{sbe.configPublic?.lastFailedPullLong}</Text>
    </>
  ) : null;
};
