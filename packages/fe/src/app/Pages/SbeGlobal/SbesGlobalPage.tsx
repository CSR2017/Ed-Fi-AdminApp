import { Box, HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { GetSbeDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { useParams } from '@tanstack/router';
import { sbeQueries } from '../../api';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { SbeGlobalLink, UserLink, sbesGlobalRoute } from '../../routes';
import { PageTemplate } from '../PageTemplate';
import { useSbeGlobalActions } from './useSbeGlobalActions';
import { BiDotsHorizontalRounded } from 'react-icons/bi';
import { TableRowActions } from '../../helpers/TableRowActions';

const SbesNameCell = (info: CellContext<GetSbeDto, unknown>) => {
  const deleteSbe = sbeQueries.useDelete({});
  const sbes = sbeQueries.useAll({});
  const actions = useSbeGlobalActions(info.row.original);
  return (
    <HStack justify="space-between">
      <SbeGlobalLink id={info.row.original.id} query={sbes} />
      <TableRowActions actions={actions} />
    </HStack>
  );
};

export const SbesGlobalPage = () => {
  const params = useParams({ from: sbesGlobalRoute.id });
  const sbes = sbeQueries.useAll({});
  const users = { data: undefined } as any; // userQueries.useAll({  }); //TODO add users into global scope as well

  return (
    <PageTemplate title="Starting Blocks environments">
      <DataTable
        data={Object.values(sbes?.data || {})}
        columns={[
          {
            accessorKey: 'displayName',
            cell: SbesNameCell,
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
