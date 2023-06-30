import { HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { GetEdorgDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import { edorgQueries, odsQueries, userQueries } from '../../api';
import { TableRowActions } from '../../helpers';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { useReadTenantEntity } from '../../helpers/useStandardRowActionsNew';
import { EdorgLink, edorgsRoute, OdsLink, UserLink } from '../../routes';
import { PageTemplate } from '../PageTemplate';

const NameCell = (info: CellContext<GetEdorgDto, unknown>) => {
  const params = useParams() as {
    asId: string;
    sbeId: string;
  };
  const entities = edorgQueries.useAll({
    tenantId: params.asId,
    sbeId: params.sbeId,
  });

  const View = useReadTenantEntity({
    entity: info.row.original,
    params: { ...params },
    privilege: 'tenant.sbe.edorg:read',
    route: edorgsRoute,
  });
  const actions = {
    ...(View ? { View } : undefined),
  };
  return (
    <HStack justify="space-between">
      <EdorgLink id={info.row.original.id} query={entities} />
      <TableRowActions actions={actions} />
    </HStack>
  );
};

export const EdorgsPage = () => {
  const params = useParams() as {
    asId: string;
    sbeId: string;
  };
  const odss = odsQueries.useAll({
    tenantId: params.asId,
    sbeId: params.sbeId,
  });
  const edorgs = edorgQueries.useAll({
    tenantId: params.asId,
    sbeId: params.sbeId,
  });

  const users = userQueries.useAll({ tenantId: params.asId });

  return (
    <PageTemplate title="Education Organizations">
      <DataTable
        data={Object.values(edorgs?.data || {})}
        columns={[
          {
            accessorKey: 'displayName',
            cell: NameCell,
            header: () => 'Name',
          },
          {
            id: 'parent',
            accessorFn: (info) => getRelationDisplayName(info.parentId, edorgs),
            header: () => 'Parent Ed-Org',
            cell: (info) => (
              <EdorgLink query={edorgs} id={info.row.original.parentId} />
            ),
          },
          {
            id: 'educationOrganizationId',
            accessorFn: (info) => info.educationOrganizationId,
            header: () => 'Education Org ID',
          },
          {
            id: 'ods',
            accessorFn: (info) => getRelationDisplayName(info.odsId, odss),
            header: () => 'ODS',
            cell: (info) => (
              <OdsLink query={odss} id={info.row.original.odsId} />
            ),
          },
          {
            id: 'discriminator',
            accessorFn: (info) => info.discriminator,
            header: () => 'Type',
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
