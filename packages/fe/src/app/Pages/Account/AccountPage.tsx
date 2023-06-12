import { Button } from '@chakra-ui/react';
import { useNavigate, useSearch } from '@tanstack/router';
import { BiEdit } from 'react-icons/bi';
import { useMe } from '../../api';
import { accountRouteGlobal } from '../../routes';
import { PageTemplate } from '../PageTemplate';
import { EditAccount } from './EditAccount';
import { ViewAccount } from './ViewAccount';

export const AccountPage = () => {
  const me = useMe();
  const user = me.data;
  const navigate = useNavigate();

  const edit = useSearch({ from: accountRouteGlobal.id }).edit;

  return (
    <PageTemplate constrainWidth title={user?.displayName || 'User'}>
      {user ? edit ? <EditAccount /> : <ViewAccount /> : null}
    </PageTemplate>
  );
};
