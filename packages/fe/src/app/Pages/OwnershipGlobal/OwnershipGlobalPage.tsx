import { useParams, useSearch } from '@tanstack/router';
import _ from 'lodash';
import { ReactNode } from 'react';
import { ownershipQueries } from '../../api';
import { ownershipGlobalIndexRoute } from '../../routes';
import { PageTemplate } from '../PageTemplate';
import { ActionBarActions } from '../../helpers/ActionBarActions';
import { EditOwnershipGlobal } from './EditOwnershipGlobal';
import { ViewOwnershipGlobal } from './ViewOwnershipGlobal';
import { useOwnershipGlobalActions } from './useOwnershipGlobalActions';

export const OwnershipGlobalPage = (): ReactNode => {
  const params = useParams({ from: ownershipGlobalIndexRoute.id });
  const ownership = ownershipQueries.useOne({
    id: params.ownershipId,
  }).data;
  const { edit } = useSearch({ from: ownershipGlobalIndexRoute.id });
  const actions = useOwnershipGlobalActions(ownership);

  return (
    <PageTemplate
      constrainWidth
      title={ownership?.displayName || 'Ownership'}
      actions={<ActionBarActions actions={_.omit(actions, 'View')} />}
    >
      {ownership ? (
        edit ? (
          <EditOwnershipGlobal ownership={ownership} />
        ) : (
          <ViewOwnershipGlobal />
        )
      ) : null}
    </PageTemplate>
  );
};
