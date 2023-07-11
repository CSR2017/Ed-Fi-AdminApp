import { BiPlus } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { AuthorizeComponent } from '../../helpers';
import { ActionsType, LinkActionProps } from '../../helpers/ActionsType';

// TODO rename the multi-item versions to something other than just the extra "s", which isn't visible enough.
export const useTenantsActions = (): ActionsType => {
  const navigate = useNavigate();
  return {
    Create: (props: { children: (props: LinkActionProps) => JSX.Element }) => {
      const path = '/tenants/create';
      return (
        <AuthorizeComponent
          config={{
            privilege: 'tenant:create',
            subject: {
              id: '__filtered__',
            },
          }}
        >
          <props.children
            icon={BiPlus}
            text="Create new"
            title={'Create new tenant'}
            to={path}
            onClick={() => navigate(path)}
          />
        </AuthorizeComponent>
      );
    },
  };
};
