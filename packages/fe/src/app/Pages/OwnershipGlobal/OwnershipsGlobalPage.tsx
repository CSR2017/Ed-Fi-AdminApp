import { Button, Heading, HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { useParams, Link as RouterLink } from '@tanstack/router';
import {
  ownershipQueries,
  roleQueries,
  tenantQueries,
  userQueries,
} from '../../api';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import {
  StandardRowActions,
  useStandardRowActions,
} from '../../helpers/getStandardActions';
import {
  ownershipGlobalCreateRoute,
  OwnershipGlobalLink,
  ownershipGlobalRoute,
  ownershipsGlobalRoute,
  UserLink,
} from '../../routes';
import { GetOwnershipDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { AuthorizeComponent, globalOwnershipAuthConfig } from '../../helpers';
import { PageTemplate } from '../PageTemplate';
import { BiPlus } from 'react-icons/bi';

const OwnershipsNameCell = (info: CellContext<GetOwnershipDto, unknown>) => {
  const deleteOwnership = ownershipQueries.useDelete({});
  const ownerships = ownershipQueries.useAll({});
  const [View, Edit, Delete] = useStandardRowActions({
    info: info,
    mutation: deleteOwnership.mutate,
    route: ownershipGlobalRoute,
    params: (params: any) => ({
      ...params,
      ownershipId: String(info.row.original.id),
    }),
  });
  return (
    <HStack justify="space-between">
      <OwnershipGlobalLink id={info.row.original.id} query={ownerships} />
      <HStack className="row-hover" color="gray.600" align="middle">
        <View />
        <AuthorizeComponent
          config={{
            privilege: 'ownership:update',
            subject: {
              id: info.row.original.id,
            },
          }}
        >
          <Edit />
        </AuthorizeComponent>
        <AuthorizeComponent
          config={{
            privilege: 'ownership:delete',
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

export const OwnershipsGlobalPage = () => {
  const params = useParams({ from: ownershipsGlobalRoute.id });
  const ownerships = ownershipQueries.useAll({});
  const roles = roleQueries.useAll({});
  const tenants = tenantQueries.useAll({});

  return (
    <PageTemplate
      title="Resource ownerships"
      actions={
        <AuthorizeComponent
          config={globalOwnershipAuthConfig('ownership:create')}
        >
          <RouterLink
            title="Grant new tenant resource ownership"
            to={ownershipGlobalCreateRoute.fullPath}
            params={(previous: any) => ({
              ...previous,
            })}
          >
            <Button leftIcon={<BiPlus />}>Grant new</Button>
          </RouterLink>
        </AuthorizeComponent>
      }
    >
      <DataTable
        data={Object.values(ownerships?.data || {})}
        columns={[
          {
            accessorKey: 'displayName',
            cell: OwnershipsNameCell,
            header: () => 'Name',
          },
          {
            id: 'tenant',
            accessorFn: (info) =>
              getRelationDisplayName(info.tenantId, tenants),
            header: () => 'Tenant',
            cell: (info) =>
              getRelationDisplayName(info.row.original.tenantId, tenants),
          },
          {
            id: 'role',
            accessorFn: (info) => getRelationDisplayName(info.roleId, roles),
            header: () => 'Role',
            cell: (info) =>
              getRelationDisplayName(info.row.original.roleId, roles),
          },
          {
            id: 'resource',
            accessorFn: (info) =>
              info.edorg
                ? `Ed-Org - ${info.edorg.displayName}`
                : info.ods
                ? `Ods - ${info.ods.displayName}`
                : `Environment - ${info.sbe?.displayName}`,
            header: () => 'Resource',
            cell: ({ row: { original } }) =>
              original.edorg
                ? original.edorg.displayName
                : original.ods
                ? original.ods.displayName
                : original.sbe
                ? original.sbe.displayName
                : '-',
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
