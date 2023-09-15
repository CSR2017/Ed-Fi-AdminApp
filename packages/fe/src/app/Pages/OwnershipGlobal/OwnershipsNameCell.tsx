import { HStack } from '@chakra-ui/react';
import { TableRowActions } from '@edanalytics/common-ui';
import { GetOwnershipDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { ownershipQueries } from '../../api';
import { OwnershipGlobalLink } from '../../routes';
import { useOwnershipGlobalActions } from './useOwnershipGlobalActions';

export const OwnershipsNameCell = (info: CellContext<GetOwnershipDto, unknown>) => {
  const ownerships = ownershipQueries.useAll({});
  const actions = useOwnershipGlobalActions(info.row.original);
  return (
    <HStack justify="space-between">
      <OwnershipGlobalLink id={info.row.original.id} query={ownerships} />
      <TableRowActions actions={actions} />
    </HStack>
  );
};
