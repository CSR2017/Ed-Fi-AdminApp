import { BiPlus } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { AuthorizeComponent, globalOwnershipAuthConfig } from '../../helpers';
import { ActionsType, LinkActionProps } from '../../helpers/ActionsType';

export const useMultipleOwnershipGlobalActions = (): ActionsType => {
  const navigate = useNavigate();
  return {
    Create: (props: { children: (props: LinkActionProps) => JSX.Element }) => {
      const path = `/ownerships/create`;
      return (
        <AuthorizeComponent config={globalOwnershipAuthConfig('ownership:create')}>
          <props.children
            icon={BiPlus}
            text="Grant new"
            title={'Grant new tenant resource ownership.'}
            to={path}
            onClick={() => navigate(path)}
          />
        </AuthorizeComponent>
      );
    },
  };
};
