import { useMe } from '../../api';
import { useSearchParamsObject } from '../../helpers/useSearch';
import { PageTemplate } from '../PageTemplate';
import { EditAccount } from './EditAccount';
import { ViewAccount } from './ViewAccount';

export const AccountPage = () => {
  const me = useMe();
  const user = me.data;

  const edit = useSearchParamsObject().edit;

  return (
    <PageTemplate constrainWidth title={user?.displayName || 'User'}>
      {user ? edit ? <EditAccount /> : <ViewAccount /> : null}
    </PageTemplate>
  );
};
