import { HStack } from '@chakra-ui/react';
import { TableRowActions } from '@edanalytics/common-ui';
import { GetUserTenantMembershipDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { userTenantMembershipQueries } from '../../api';
import { UtmGlobalLink } from '../../routes';
import { useUtmActionsGlobal } from './useUtmActionsGlobal';

export const UtmGlobalNameCell = (info: CellContext<GetUserTenantMembershipDto, unknown>) => {
  const userTenantMemberships = userTenantMembershipQueries.useAll({});
  const actions = useUtmActionsGlobal(info.row.original);
  return (
    <HStack justify="space-between">
      <UtmGlobalLink id={info.row.original.id} query={userTenantMemberships} />
      <TableRowActions actions={actions} />
    </HStack>
  );
};
