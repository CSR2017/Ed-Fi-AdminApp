import { HStack } from '@chakra-ui/react';
import { GetClaimsetDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { claimsetQueries } from '../../api';
import { TableRowActions } from '../../helpers';
import { ClaimsetLink } from '../../routes';
import { useClaimsetActions } from './useClaimsetActions';

export const NameCell = (params: { asId: string; sbeId: string }) => {
  const Component = (info: CellContext<GetClaimsetDto, unknown>) => {
    const entities = claimsetQueries.useAll({
      tenantId: params.asId,
      sbeId: params.sbeId,
    });

    const actions = useClaimsetActions({
      claimset: info.row.original,
      sbeId: params.sbeId,
      tenantId: params.asId,
    });
    return (
      <HStack justify="space-between">
        <ClaimsetLink id={info.row.original.id} query={entities} />
        <TableRowActions actions={actions} />
      </HStack>
    );
  };
  return Component;
};
