import { GetOwnershipDto } from '@edanalytics/models';
import { useNavigate, useParams } from 'react-router-dom';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { HiOutlineEye } from 'react-icons/hi';
import { ownershipQueries } from '../../api';
import { AuthorizeComponent } from '../../helpers';
import { ownershipGlobalIndexRoute, ownershipsGlobalRoute } from '../../routes';
import { ActionPropsConfirm, ActionsType, LinkActionProps } from '../../helpers/ActionsType';

export const useOwnershipGlobalActions = (ownership: GetOwnershipDto | undefined): ActionsType => {
  const params = useParams() as {
    ownershipId: string;
  };
  const navigate = useNavigate();
  const to = (id: number | string) => `/ownerships/${id}`;
  const deleteOwnership = ownershipQueries.useDelete({});
  return ownership === undefined
    ? {}
    : {
        View: (props: { children: (props: LinkActionProps) => JSX.Element }) => {
          const path = to(ownership.id);
          return (
            <AuthorizeComponent
              config={{
                privilege: 'ownership:read',
                subject: {
                  id: ownership.id,
                },
              }}
            >
              <props.children
                icon={HiOutlineEye}
                text="View"
                title={'View ' + ownership.displayName}
                to={path}
                onClick={() => navigate(path)}
              />
            </AuthorizeComponent>
          );
        },
        Edit: (props: { children: (props: LinkActionProps) => JSX.Element }) => {
          const path = to(ownership.id);
          return (
            <AuthorizeComponent
              config={{
                privilege: 'ownership:update',
                subject: {
                  id: ownership.id,
                },
              }}
            >
              <props.children
                icon={BiEdit}
                text="Edit"
                title={'Edit ' + ownership.displayName}
                to={path + '?edit=true'}
                onClick={() => navigate(path + '?edit=true')}
              />
            </AuthorizeComponent>
          );
        },
        Delete: (props: { children: (props: ActionPropsConfirm) => JSX.Element }) => {
          return (
            <AuthorizeComponent
              config={{
                privilege: 'ownership:delete',
                subject: {
                  id: ownership.id,
                },
              }}
            >
              <props.children
                icon={BiTrash}
                isDisabled={deleteOwnership.isLoading}
                text="Delete"
                title="Delete ownership"
                confirmBody="This will permanently delete the ownership."
                onClick={() =>
                  deleteOwnership.mutateAsync(ownership.id, {
                    onSuccess: () => navigate(`/ownerships`),
                  })
                }
                confirm={true}
              />
            </AuthorizeComponent>
          );
        },
      };
};
