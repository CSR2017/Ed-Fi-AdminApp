import { FormLabel, Text } from '@chakra-ui/react';
import { GetSbeDto } from '@edanalytics/models';

export const ViewSbeGlobal = (props: { sbe: GetSbeDto }) => {
  const { sbe } = props;
  return (
    <>
      <FormLabel as="p">Environment label</FormLabel>
      <Text>{sbe.envLabel}</Text>
      <FormLabel as="p">Admin API URL</FormLabel>
      <Text>{sbe.configPublic?.adminApiUrl}</Text>
      <FormLabel as="p">Admin API key</FormLabel>
      <Text>{sbe.configPublic?.adminApiKey}</Text>
      <FormLabel as="p">Admin API client name</FormLabel>
      <Text>{sbe.configPublic?.adminApiClientDisplayName}</Text>
      <FormLabel as="p">SB metadata URL</FormLabel>
      <Text>{sbe.configPublic?.sbeMetaUrl}</Text>
      {sbe.configPublic?.sbeMetaKey ? (
        <>
          <FormLabel as="p">SB metadata key</FormLabel>
          <Text>{sbe.configPublic?.sbeMetaKey}</Text>
        </>
      ) : null}
      <FormLabel as="p">Last successful connection to Starting Blocks</FormLabel>
      <Text>{sbe.configPublic?.lastSuccessfulConnectionSbMetaLong}</Text>
      <FormLabel as="p">Last failed connection to Starting Blocks</FormLabel>
      <Text>{sbe.configPublic?.lastFailedConnectionSbMetaLong}</Text>
      <FormLabel as="p">Last successful connection to Ed-Fi Admin API</FormLabel>
      <Text>{sbe.configPublic?.lastSuccessfulConnectionAdminApiLong}</Text>
      <FormLabel as="p">Last failed connection to Ed-Fi Admin API</FormLabel>
      <Text>{sbe.configPublic?.lastFailedConnectionAdminApiLong}</Text>
      <FormLabel as="p">Last successful sync with Starting Blocks</FormLabel>
      <Text>{sbe.configPublic?.lastSuccessfulPullLong}</Text>
      <FormLabel as="p">Last failed sync with Starting Blocks</FormLabel>
      <Text>{sbe.configPublic?.lastFailedPullLong}</Text>
    </>
  );
};
