import { GetTenantDto } from '@edanalytics/models';
import { BiArch, BiEdit, BiTrash } from 'react-icons/bi';
import { HiOutlineEye } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { tenantQueries } from '../../api';
import { AuthorizeComponent } from '../../helpers';
import { ActionPropsConfirm, ActionsType, LinkActionProps } from '../../helpers/ActionsType';

export const useTenantActions = (tenant: GetTenantDto | undefined): ActionsType => {
  const navigate = useNavigate();
  const to = (id: number | string) => `/tenants/${id}`;
  const deleteTenant = tenantQueries.useDelete({});
  return tenant === undefined
    ? {}
    : {
        Assume: (props: { children: (props: LinkActionProps) => JSX.Element }) => {
          const path = `/as/${tenant.id}`;
          return (
            <AuthorizeComponent
              config={{
                privilege: 'tenant:read',
                subject: {
                  id: tenant.id,
                },
              }}
            >
              <props.children
                icon={BiArch}
                text="Assume"
                title={'Assume ' + tenant.displayName + ' tenant scope'}
                to={path}
                onClick={() => navigate(path)}
              />
            </AuthorizeComponent>
          );
        },
        View: (props: { children: (props: LinkActionProps) => JSX.Element }) => {
          const path = to(tenant.id);
          return (
            <AuthorizeComponent
              config={{
                privilege: 'tenant:read',
                subject: {
                  id: tenant.id,
                },
              }}
            >
              <props.children
                icon={HiOutlineEye}
                text="View"
                title={'View ' + tenant.displayName}
                to={path}
                onClick={() => navigate(path)}
              />
            </AuthorizeComponent>
          );
        },
        Edit: (props: { children: (props: LinkActionProps) => JSX.Element }) => {
          const path = to(tenant.id);
          return (
            <AuthorizeComponent
              config={{
                privilege: 'tenant:update',
                subject: {
                  id: tenant.id,
                },
              }}
            >
              <props.children
                icon={BiEdit}
                text="Edit"
                title={'Edit ' + tenant.displayName}
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
                privilege: 'tenant:update',
                subject: {
                  id: tenant.id,
                },
              }}
            >
              <props.children
                icon={BiTrash}
                text="Delete"
                title="Delete tenant"
                confirmBody="This will permanently delete the tenant."
                onClick={() =>
                  deleteTenant.mutateAsync(tenant.id, {
                    onSuccess: () => navigate(`/tenants`),
                  })
                }
                confirm={true}
              />
            </AuthorizeComponent>
          );
        },
      };
};
