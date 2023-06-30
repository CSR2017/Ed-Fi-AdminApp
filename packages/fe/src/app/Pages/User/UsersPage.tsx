import { HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { GetUserTenantMembershipDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import {
  roleQueries,
  userQueries,
  userTenantMembershipQueries,
} from '../../api';
import { TableRowActions } from '../../helpers/TableRowActions';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { useReadTenantEntity } from '../../helpers/useStandardRowActionsNew';
import { RoleLink, UserLink, userRoute } from '../../routes';
import { PageTemplate } from '../PageTemplate';

const NameCell = (info: CellContext<GetUserTenantMembershipDto, unknown>) => {
  const params = useParams() as { asId: string };
  const users = userQueries.useAll({
    tenantId: params.asId,
  });

  const View = useReadTenantEntity({
    entity: info.row.original,
    params: { ...params },
    privilege: 'tenant.user:read',
    route: userRoute,
  });
  const actions = {
    ...(View ? { View } : undefined),
  };
  return (
    <HStack justify="space-between">
      <UserLink id={info.row.original.userId} query={users} />
      <TableRowActions actions={actions} />
    </HStack>
  );
};
export const UsersPage = () => {
  const params = useParams() as { asId: string };
  const users = userQueries.useAll({
    tenantId: params.asId,
  });

  const roles = roleQueries.useAll({
    tenantId: params.asId,
  });

  const userTenantMemberships = userTenantMembershipQueries.useAll({
    tenantId: params.asId,
  });

  return (
    <PageTemplate title="Users">
      <DataTable
        data={Object.values(userTenantMemberships?.data || {})}
        columns={[
          {
            id: 'displayName',
            accessorFn: (info) => getRelationDisplayName(info.userId, users),
            cell: NameCell,
            header: () => 'Name',
          },
          {
            id: 'role',
            accessorFn: (info) => getRelationDisplayName(info.roleId, roles),
            cell: (info) => (
              <RoleLink id={info.row.original.roleId} query={roles} />
            ),
            header: () => 'Tenant role',
          },
          {
            accessorKey: 'createdDetailed',
            header: () => 'Created',
          },
        ]}
      />
    </PageTemplate>
  );
};
