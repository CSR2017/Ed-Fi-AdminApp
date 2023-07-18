import { HStack } from '@chakra-ui/react';
import { GetOdsDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { odsQueries } from '../../api/queries/queries';
import { TableRowActions } from '../../helpers';
import { useReadTenantEntity } from '../../helpers/useStandardRowActionsNew';
import { OdsLink, odsRoute } from '../../routes';

export const NameCell = (params: { asId: string; sbeId: string }) => {
  const Component = (info: CellContext<GetOdsDto, unknown>) => {
    const entities = odsQueries.useAll({
      sbeId: params.sbeId,
      tenantId: params.asId,
    });

    const View = useReadTenantEntity({
      entity: info.row.original,
      params: { ...params, odsId: info.row.original.id },
      privilege: 'tenant.sbe.ods:read',
      route: odsRoute,
    });
    const actions = {
      ...(View ? { View } : undefined),
    };
    return (
      <HStack justify="space-between">
        <OdsLink id={info.row.original.id} query={entities} />
        <TableRowActions actions={actions} />
      </HStack>
    );
  };
  return Component;
};
