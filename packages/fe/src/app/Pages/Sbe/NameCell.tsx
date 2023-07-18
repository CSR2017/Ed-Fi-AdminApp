import { HStack } from '@chakra-ui/react';
import { GetSbeDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import { sbeQueries } from '../../api';
import { TableRowActions } from '../../helpers/TableRowActions';
import { useReadTenantEntity } from '../../helpers/useStandardRowActionsNew';
import { SbeLink, sbeRoute } from '../../routes';

export const NameCell = (info: CellContext<GetSbeDto, unknown>) => {
  const params = useParams() as { asId: string };
  const sbes = sbeQueries.useAll({
    tenantId: params.asId,
  });
  const View = useReadTenantEntity({
    entity: info.row.original,
    params: { sbeId: String(info.row.original.id), ...params },
    privilege: 'tenant.user:read',
    route: sbeRoute,
  });
  const actions = {
    ...(View ? { View } : undefined),
  };
  return (
    <HStack justify="space-between">
      <SbeLink id={info.row.original.id} query={sbes} />
      <TableRowActions actions={actions} />
    </HStack>
  );
};
