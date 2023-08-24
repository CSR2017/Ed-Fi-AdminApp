import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { PageTemplate } from '../../Layout/PageTemplate';
import { sbeQueries } from '../../api';
import { ActionBarActions } from '../../helpers/ActionBarActions';
import { useSearchParamsObject } from '../../helpers/useSearch';
import { EditSbeMeta } from './EditSbeMeta';
import { RegisterSbeAdminApi } from './RegisterSbeAdminApi';
import { ViewSbeGlobal } from './ViewSbeGlobal';
import { useSbeGlobalActions } from './useSbeGlobalActions';
import { EditSbe } from './EditSbe';

export const SbeGlobalPage = () => {
  const params = useParams() as { sbeId: string };
  const sbe = sbeQueries.useOne({
    id: params.sbeId,
  }).data;
  const { edit } = useSearchParamsObject() as {
    edit?: 'admin-api' | 'sbe-meta' | 'name';
  };

  const actions = useSbeGlobalActions(sbe);

  return (
    <PageTemplate
      title={sbe?.displayName || 'Sbe'}
      actions={<ActionBarActions actions={_.omit(actions, 'View')} />}
    >
      {sbe ? (
        edit === 'admin-api' ? (
          <RegisterSbeAdminApi sbe={sbe} />
        ) : edit === 'sbe-meta' ? (
          <EditSbeMeta sbe={sbe} />
        ) : edit === 'name' ? (
          <EditSbe sbe={sbe} />
        ) : (
          <ViewSbeGlobal sbe={sbe} />
        )
      ) : null}
    </PageTemplate>
  );
};
