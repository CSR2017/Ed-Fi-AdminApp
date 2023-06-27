import { GetOwnershipDto } from '@edanalytics/models';
import { useNavigate } from '@tanstack/router';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { HiOutlineEye } from 'react-icons/hi';
import { ownershipQueries } from '../../api';
import { AuthorizeComponent } from '../../helpers';
import { ownershipGlobalIndexRoute, ownershipsGlobalRoute } from '../../routes';
import {
  ActionPropsConfirm,
  ActionsType,
  LinkActionProps,
} from '../../helpers/ActionsType';

export const useOwnershipGlobalActions = (
  ownership: GetOwnershipDto | undefined
): ActionsType => {
  const navigate = useNavigate();
  const path = ownershipGlobalIndexRoute.fullPath;
  const deleteOwnership = ownershipQueries.useDelete({});
  return ownership === undefined
    ? {}
    : {
        View: (props: {
          children: (props: LinkActionProps) => JSX.Element;
        }) => {
          const toOptions = {
            to: path,
            params: (old: any) => ({
              ...old,
              ownershipId: String(ownership.id),
            }),
          };
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
                linkProps={toOptions}
                onClick={() => navigate(toOptions)}
              />
            </AuthorizeComponent>
          );
        },
        Edit: (props: {
          children: (props: LinkActionProps) => JSX.Element;
        }) => {
          const toOptions = {
            to: path,
            params: (old: any) => ({
              ...old,
              ownershipId: String(ownership.id),
            }),
            search: { edit: true },
          };
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
                linkProps={toOptions}
                onClick={() => navigate(toOptions)}
              />
            </AuthorizeComponent>
          );
        },
        Delete: (props: {
          children: (props: ActionPropsConfirm) => JSX.Element;
        }) => {
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
                icon={BiTrash}
                text="Delete"
                title="Delete ownership"
                confirmBody="This will permanently delete the ownership."
                onClick={() =>
                  deleteOwnership.mutateAsync(ownership.id, {
                    onSuccess: () =>
                      navigate({ to: ownershipsGlobalRoute.fullPath }),
                  })
                }
                confirm={true}
              />
            </AuthorizeComponent>
          );
        },
      };
};
