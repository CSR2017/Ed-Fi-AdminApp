import { Heading, HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { StandardRowActions } from '../../helpers/getStandardActions';
import { RoleLink, UserLink, userRoute, usersRoute } from '../../routes';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from '@tanstack/router';
import {
  roleQueries,
  userQueries,
  userTenantMembershipQueries,
} from '../../api';
import { PageTemplate } from '../PageTemplate';

export const UsersPage = () => {
  const params = useParams({ from: usersRoute.id });
  const users = userQueries.useAll({
    tenantId: params.asId,
  });
  const deleteUser = userQueries.useDelete({
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
            cell: (info) => (
              <HStack justify="space-between">
                <UserLink id={info.row.original.userId} query={users} />
                <HStack className="row-hover" color="gray.600" align="middle">
                  <StandardRowActions
                    info={info}
                    mutation={deleteUser.mutate}
                    route={userRoute}
                    params={(params: any) => ({
                      ...params,
                      userId: String(info.row.original.userId),
                    })}
                  />
                </HStack>
              </HStack>
            ),
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
