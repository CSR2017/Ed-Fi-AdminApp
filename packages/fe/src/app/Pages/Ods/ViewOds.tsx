import { FormLabel, Text } from '@chakra-ui/react';
import { useParams } from '@tanstack/router';
import { odsQueries, sbeQueries } from '../../api';
import { SbeLink, odsRoute } from '../../routes';

export const ViewOds = () => {
  const params = useParams({ from: odsRoute.id });
  const ods = odsQueries.useOne({
    id: params.odsId,
    sbeId: params.sbeId,
    tenantId: params.asId,
  }).data;
  const sbes = sbeQueries.useAll({
    tenantId: params.asId,
  });

  return ods ? (
    <>
      <FormLabel as="p">Environment</FormLabel>
      <SbeLink id={ods.sbeId} query={sbes} />
    </>
  ) : null;
};
