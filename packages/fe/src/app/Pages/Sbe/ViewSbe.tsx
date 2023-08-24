import { FormLabel, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { sbeQueries } from '../../api';
import { Attribute } from '@edanalytics/common-ui';

export const ViewSbe = () => {
  const params = useParams() as {
    asId: string;
    sbeId: string;
  };
  const sbe = sbeQueries.useOne({
    id: params.sbeId,
    tenantId: params.asId,
  }).data;

  return sbe ? (
    <>
      <Attribute label="Environment label" value={sbe.envLabel} />
      <Attribute
        label="Last successful connection to Starting Blocks"
        value={sbe.configPublic?.lastSuccessfulConnectionSbMeta}
        isDate
      />
      <Attribute
        label="Last failed connection to Starting Blocks"
        value={sbe.configPublic?.lastFailedConnectionSbMeta}
        isDate
      />
      <Attribute
        label="Last successful connection to Ed-Fi Admin API"
        value={sbe.configPublic?.lastSuccessfulConnectionAdminApi}
        isDate
      />
      <Attribute
        label="Last failed connection to Ed-Fi Admin API"
        value={sbe.configPublic?.lastFailedConnectionAdminApi}
        isDate
      />
      <Attribute
        label="Last successful sync with Starting Blocks"
        value={sbe.configPublic?.lastSuccessfulPull}
        isDate
      />
      <Attribute
        label="Last failed sync with Starting Blocks"
        value={sbe.configPublic?.lastFailedPull}
        isDate
      />
    </>
  ) : null;
};
