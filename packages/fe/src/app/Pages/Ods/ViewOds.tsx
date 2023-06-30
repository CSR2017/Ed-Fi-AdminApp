import { FormLabel } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { odsQueries, sbeQueries } from '../../api';
import { SbeLink } from '../../routes';

export const ViewOds = () => {
  const params = useParams() as {
    asId: string;
    sbeId: string;
    odsId: string;
  };
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
