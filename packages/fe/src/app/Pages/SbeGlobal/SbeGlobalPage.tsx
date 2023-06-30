import { useParams, useSearchParams } from 'react-router-dom';
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
import { useSearchParamsObject } from '../../helpers/useSearch';

export const SbeGlobalPage = () => {
  const params = useParams() as { sbeId: string };
  const sbe = sbeQueries.useOne({
    id: params.sbeId,
  }).data;
  const { edit } = useSearchParamsObject() as {
    edit?: 'admin-api' | 'sbe-meta';
  };

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
