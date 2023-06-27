import { GetRoleDto } from '@edanalytics/models';
import { useNavigate, useParams } from '@tanstack/router';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { HiOutlineEye } from 'react-icons/hi';
import { roleQueries } from '../../api';
import { AuthorizeComponent, tenantRoleAuthConfig } from '../../helpers';
import { roleIndexRoute, rolesRoute } from '../../routes';
import {
  ActionsType,
  LinkActionProps,
  ActionPropsConfirm,
} from '../../helpers/ActionsType';

export const useRoleActions = (role: GetRoleDto | undefined): ActionsType => {
  const navigate = useNavigate();
  const path = roleIndexRoute.fullPath;
  const deleteRole = roleQueries.useDelete({});
  const params = useParams({ from: rolesRoute.id });
  return role === undefined
    ? {}
    : {
        View: (props: {
          children: (props: LinkActionProps) => JSX.Element;
        }) => {
          const toOptions = {
            to: path,
            params: (old: any) => ({
              ...old,
              roleId: String(role.id),
            }),
          };
          return (
            <AuthorizeComponent
              config={tenantRoleAuthConfig(
                role.id,
                Number(params.asId),
                'tenant.role:read'
              )}
            >
              <props.children
                icon={HiOutlineEye}
                text="View"
                title={'View ' + role.displayName}
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
              roleId: String(role.id),
            }),
            search: { edit: true },
          };
          return (
            <AuthorizeComponent
              config={tenantRoleAuthConfig(
                role.id,
                role.tenantId,
                'tenant.role:update'
              )}
            >
              <props.children
                icon={BiEdit}
                text="Edit"
                title={'Edit ' + role.displayName}
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
              config={tenantRoleAuthConfig(
                role.id,
                role.tenantId,
                'tenant.role:delete'
              )}
            >
              <props.children
                icon={BiTrash}
                text="Delete"
                title="Delete role"
                confirmBody="This will permanently delete the role."
                onClick={() =>
                  deleteRole.mutateAsync(role.id, {
                    onSuccess: () =>
                      navigate({
                        to: rolesRoute.fullPath,
                        params: (old: any) => old,
                      }),
                  })
                }
                confirm={true}
              />
            </AuthorizeComponent>
          );
        },
      };
};
