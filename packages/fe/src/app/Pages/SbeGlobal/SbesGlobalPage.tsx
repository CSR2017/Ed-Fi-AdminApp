import { HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { GetSbeDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { useParams } from '@tanstack/router';
import { sbeQueries } from '../../api';
import { AuthorizeComponent } from '../../helpers';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { useStandardRowActions } from '../../helpers/getStandardActions';
import {
  SbeGlobalLink,
  sbeGlobalRoute,
  sbesGlobalRoute,
  UserLink,
} from '../../routes';
import { PageTemplate } from './PageTemplate';

const SbesNameCell = (info: CellContext<GetSbeDto, unknown>) => {
  const deleteSbe = sbeQueries.useDelete({});
  const sbes = sbeQueries.useAll({});
  const [View, Edit, Delete] = useStandardRowActions({
    info: info,
    mutation: deleteSbe.mutate,
    route: sbeGlobalRoute,
    params: (params: any) => ({
      ...params,
      sbeId: String(info.row.original.id),
    }),
  });
  return (
    <HStack justify="space-between">
      <SbeGlobalLink id={info.row.original.id} query={sbes} />
      <HStack className="row-hover" color="gray.600" align="middle">
        <View />
        <AuthorizeComponent
          config={{
            privilege: 'sbe:update',
            subject: {
              id: info.row.original.id,
            },
          }}
        >
          <Edit />
        </AuthorizeComponent>
        <AuthorizeComponent
          config={{
            privilege: 'sbe:delete',
            subject: {
              id: info.row.original.id,
            },
          }}
        >
          <Delete />
        </AuthorizeComponent>
      </HStack>
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
