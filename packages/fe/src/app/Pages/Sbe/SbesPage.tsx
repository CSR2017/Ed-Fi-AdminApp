import { HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { GetSbeDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import { sbeQueries, userQueries } from '../../api';
import { TableRowActions } from '../../helpers/TableRowActions';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { useReadTenantEntity } from '../../helpers/useStandardRowActionsNew';
import { SbeLink, UserLink, sbeRoute } from '../../routes';
import { PageTemplate } from '../PageTemplate';

const NameCell = (info: CellContext<GetSbeDto, unknown>) => {
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

export const SbesPage = () => {
  const params = useParams();
  const sbes = sbeQueries.useAll({
    tenantId: params.asId,
  });
  const users = userQueries.useAll({ tenantId: params.asId });

  return (
    <PageTemplate title="Starting Blocks environments">
      <DataTable
        data={Object.values(sbes?.data || {})}
        columns={[
          {
            accessorKey: 'displayName',
            cell: NameCell,
            header: () => 'Name',
          },
          {
            id: 'modifiedBy',
            accessorFn: (info) =>
              getRelationDisplayName(info.modifiedById, users),
            header: () => 'Modified by',
            cell: (info) => (
              <UserLink query={users} id={info.row.original.modifiedById} />
            ),
          },
          {
            accessorKey: 'createdDetailed',
            header: () => 'Created',
          },
          {
            id: 'createdBy',
            accessorFn: (info) =>
              getRelationDisplayName(info.createdById, users),
            header: () => 'Created by',
            cell: (info) => (
              <UserLink query={users} id={info.row.original.createdById} />
            ),
          },
        ]}
      />
    </PageTemplate>
  );
};
