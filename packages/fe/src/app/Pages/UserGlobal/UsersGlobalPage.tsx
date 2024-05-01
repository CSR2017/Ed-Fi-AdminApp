import { HStack } from '@chakra-ui/react';
import {
  PageActions,
  PageTemplate,
  SbaaTableAllInOne,
  TableRowActions,
  ValueAsDate,
} from '@edanalytics/common-ui';
import { GetUserDto } from '@edanalytics/models';
import { useQuery } from '@tanstack/react-query';
import { CellContext } from '@tanstack/react-table';
import { roleQueries, userQueries } from '../../api';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { UserGlobalLink } from '../../routes';
import { RoleGlobalLink } from '../../routes/role-global.routes';
import { useMultipleUserGlobalActions } from './useMultipleUserGlobalActions';
import { useUserGlobalActions } from './useUserGlobalActions';

const NameCell = (info: CellContext<GetUserDto, unknown>) => {
  const users = useQuery(userQueries.getAll({}));
  const actions = useUserGlobalActions(info.row.original);
  return (
    <HStack justify="space-between">
      <UserGlobalLink id={info.row.original.id} query={users} />
      <TableRowActions actions={actions} />
    </HStack>
  );
};

export const UsersGlobalPage = () => {
  const users = useQuery(userQueries.getAll({}));
  const roles = useQuery(roleQueries.getAll({}));
  const actions = useMultipleUserGlobalActions();
  return (
    <PageTemplate title="Users" actions={<PageActions actions={actions} />}>
      <SbaaTableAllInOne
        data={Object.values(users?.data || {})}
        columns={[
          {
            accessorKey: 'displayName',
            cell: NameCell,
            header: 'Name',
          },
          {
            accessorKey: 'username',
            header: 'Username',
          },
          {
            id: 'role',
            accessorFn: (info) => getRelationDisplayName(info.roleId, roles),
            header: 'Role',
            cell: (info) => <RoleGlobalLink id={info.row.original.roleId} query={roles} />,
            filterFn: 'equalsString',
            meta: {
              type: 'options',
            },
          },
          {
            accessorKey: 'createdNumber',
            cell: ValueAsDate(),
            header: 'Created',
            meta: {
              type: 'date',
            },
          },
        ]}
      />
    </PageTemplate>
  );
};
