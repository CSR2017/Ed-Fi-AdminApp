import { HStack } from '@chakra-ui/react';
import { GetEdorgDto } from '@edanalytics/models';
import { CellContext } from '@tanstack/react-table';
import { edorgQueries } from '../../api';
import { TableRowActions } from '../../helpers';
import { useReadTenantEntity } from '../../helpers/useStandardRowActionsNew';
import { EdorgLink, edorgIndexRoute } from '../../routes';

export const NameCell = (params: { asId: string; sbeId: string }) => {
  const Component = (info: CellContext<GetEdorgDto, unknown>) => {
    const entities = edorgQueries.useAll({
      tenantId: params.asId,
      sbeId: params.sbeId,
    });

    const View = useReadTenantEntity({
      entity: info.row.original,
      params: { ...params, edorgId: info.row.original.id },
      privilege: 'tenant.sbe.edorg:read',
      route: edorgIndexRoute,
    });
    const actions = {
      ...(View ? { View } : undefined),
    };
    return (
      <HStack justify="space-between">
        <EdorgLink id={info.row.original.id} query={entities} />
        <TableRowActions actions={actions} />
      </HStack>
    );
  };
  return Component;
};
