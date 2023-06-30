import _ from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';
import { userQueries } from '../../api';
import { useNavToParent } from '../../helpers';
import { ActionBarActions } from '../../helpers/ActionBarActions';
import { useSearchParamsObject } from '../../helpers/useSearch';
import { PageTemplate } from '../PageTemplate';
import { EditUser } from './EditUser';
import { ViewUser } from './ViewUser';

export const UserPage = () => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();

  const params = useParams() as {
    asId: string;
    userId: string;
  };
  const deleteUser = userQueries.useDelete({
    callback: () => {
      navigate(navToParentOptions);
    },
    tenantId: params.asId,
  });
  const user = userQueries.useOne({
    id: params.userId,
    tenantId: params.asId,
  }).data;
  const { edit } = useSearchParamsObject() as { edit?: boolean };

  const actions = {};

  return (
    <PageTemplate
      constrainWidth
      title={user?.displayName || 'User'}
      actions={<ActionBarActions actions={_.omit(actions, 'View')} />}
    >
      {user ? edit ? <EditUser /> : <ViewUser /> : null}
    </PageTemplate>
  );
};
