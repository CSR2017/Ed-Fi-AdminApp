import _ from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';
import { tenantQueries } from '../../api';
import { ActionBarActions, useNavToParent } from '../../helpers';
import { useSearchParamsObject } from '../../helpers/useSearch';
import { PageTemplate } from '../../Layout/PageTemplate';
import { EditTenant } from './EditTenant';
import { ViewTenant } from './ViewTenant';
import { useTenantActions } from './useTenantActions';

export const TenantPage = () => {
  const params = useParams() as { tenantId: string };
  const tenant = tenantQueries.useOne({
    id: params.tenantId,
  }).data;
  const { edit } = useSearchParamsObject() as { edit?: boolean };
  const actions = useTenantActions(tenant);
  return (
    <PageTemplate
      title={tenant?.displayName || 'Tenant'}
      actions={<ActionBarActions actions={_.omit(actions, 'View')} />}
      constrainWidth
    >
      {tenant ? edit ? <EditTenant /> : <ViewTenant /> : null}
    </PageTemplate>
  );
};
