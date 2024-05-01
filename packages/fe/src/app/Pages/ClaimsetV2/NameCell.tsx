import { HStack } from '@chakra-ui/react';
import { TableRowActions } from '@edanalytics/common-ui';
import { CellContext } from '@tanstack/react-table';
import { claimsetQueriesV1 } from '../../api';

import { GetClaimsetMultipleDtoV2 } from '@edanalytics/models';
import { useQuery } from '@tanstack/react-query';
import { useTeamEdfiTenantNavContextLoaded } from '../../helpers';
import { ClaimsetLinkV1 } from '../../routes';
import { useClaimsetActions } from './useClaimsetActions';

export const NameCell = (info: CellContext<GetClaimsetMultipleDtoV2, unknown>) => {
  const { teamId, edfiTenant } = useTeamEdfiTenantNavContextLoaded();
  const entities = useQuery(
    claimsetQueriesV1.getAll({
      teamId,
      edfiTenant,
    })
  );

  const actions = useClaimsetActions({
    claimset: info.row.original,
  });
  return (
    <HStack justify="space-between">
      <ClaimsetLinkV1 id={info.row.original.id} query={entities} />
      <TableRowActions actions={actions} />
    </HStack>
  );
};
