import { useParams, useSearch } from '@tanstack/router';
import _ from 'lodash';
import { ReactNode } from 'react';
import { sbeQueries } from '../../api';
import { ActionBarButton } from '../../helpers';
import { sbeGlobalIndexRoute } from '../../routes';
import { PageTemplate } from '../PageTemplate';
import { EditSbeAdminApi } from './EditSbeAdminApi';
import { EditSbeMeta } from './EditSbeMeta';
import { RegisterSbeAdminApi } from './RegisterSbeAdminApi';
import { ViewSbeGlobal } from './ViewSbeGlobal';
import { useSbeGlobalActions } from './useSbeGlobalActions';
import { ActionBarActions } from '../../helpers/ActionBarActions';

export const SbeGlobalPage = (): ReactNode => {
  const params = useParams({ from: sbeGlobalIndexRoute.id });
  const sbe = sbeQueries.useOne({
    id: params.sbeId,
  }).data;
  const { edit } = useSearch({ from: sbeGlobalIndexRoute.id });

  const actions = useSbeGlobalActions(sbe);

  return (
    <PageTemplate
      constrainWidth
      title={sbe?.displayName || 'Sbe'}
      actions={<ActionBarActions actions={_.omit(actions, 'View')} />}
    >
      {sbe ? (
        edit === 'admin-api' ? (
          <RegisterSbeAdminApi sbe={sbe} />
        ) : edit === 'sbe-meta' ? (
          <EditSbeMeta sbe={sbe} />
        ) : (
          <ViewSbeGlobal sbe={sbe} />
        )
      ) : null}
    </PageTemplate>
  );
};
