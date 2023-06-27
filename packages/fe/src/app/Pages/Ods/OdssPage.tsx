import { HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { GetOdsDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { useParams } from '@tanstack/router';
import { odsQueries, userQueries } from '../../api/queries/queries';
import { TableRowActions } from '../../helpers';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { useReadTenantEntity } from '../../helpers/useStandardRowActionsNew';
import { OdsLink, odsRoute, odssRoute, UserLink } from '../../routes';
import { PageTemplate } from '../PageTemplate';

const NameCell = (info: CellContext<GetOdsDto, unknown>) => {
  const params = useParams({ from: odssRoute.id });
  const entities = odsQueries.useAll({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });

  const View = useReadTenantEntity({
    entity: info.row.original,
    params: { odsId: String(info.row.original.id), ...params },
    privilege: 'tenant.sbe.ods:read',
    route: odsRoute,
  });
  const actions = {
    ...(View ? { View } : undefined),
  };
  return (
    <HStack justify="space-between">
      <OdsLink id={info.row.original.id} query={entities} />
      <TableRowActions actions={actions} />
    </HStack>
  );
};

export const OdssPage = () => {
  const params = useParams({ from: odssRoute.id });
  const odss = odsQueries.useAll({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  const users = userQueries.useAll({ tenantId: params.asId });

  return (
    <PageTemplate title="Operational Data Stores">
      <DataTable
        data={Object.values(odss?.data || {})}
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
