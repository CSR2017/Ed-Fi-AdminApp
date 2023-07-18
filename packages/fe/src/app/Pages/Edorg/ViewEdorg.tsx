import { FormLabel, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { edorgQueries, odsQueries, sbeQueries } from '../../api';
import { EdorgLink, OdsLink, SbeLink } from '../../routes';
import { AuthorizeConfig, useQueryIfAuth } from '../../helpers';

export const ViewEdorg = () => {
  const params = useParams() as {
    asId: string;
    sbeId: string;
    edorgId: string;
  };
  const edorg = edorgQueries.useOne({
    id: params.edorgId,
    sbeId: params.sbeId,
    tenantId: params.asId,
  }).data;
  const edorgs = edorgQueries.useAll({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  const odss = odsQueries.useAll({ tenantId: params.asId, sbeId: params.sbeId, optional: true });
  const sbes = sbeQueries.useAll({
    tenantId: params.asId,
  });

  return edorg ? (
    <>
      <FormLabel as="p">Type</FormLabel>
      <Text>{edorg.discriminator}</Text>
      {edorg.parentId ? (
        <>
          <FormLabel as="p">Parent</FormLabel>
          <EdorgLink id={edorg.parentId} query={edorgs} />
        </>
      ) : null}
      <FormLabel as="p">Ods</FormLabel>
      <OdsLink id={edorg.odsId} query={odss} />
      <FormLabel as="p">Environment</FormLabel>
      <SbeLink id={edorg.sbeId} query={sbes} />
    </>
  ) : null;
};
