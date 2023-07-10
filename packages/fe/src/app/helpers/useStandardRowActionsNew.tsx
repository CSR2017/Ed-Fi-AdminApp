import { TenantBasePrivilege, TenantSbePrivilege, isSbePrivilege } from '@edanalytics/models';
import { MutateOptions } from '@tanstack/react-query';
import { AnyRoute, useNavigate } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { HiOutlineEye } from 'react-icons/hi';
import { ActionPropsConfirm, LinkActionProps } from './ActionsType';
import { AuthorizeComponent } from './Authorize';

export type BaseRow = { id: number; displayName: string };

export const useDeleteTenantEntity = (props: {
  route: AnyRoute;
  entity: BaseRow | undefined;
  params: { asId: string; sbeId?: string | undefined };
  privilege: TenantBasePrivilege | TenantSbePrivilege;
  entityName: string;
  mutation: (id: number) => Promise<void>;
}) => {
  const navigate = useNavigate();
  const { entity, mutation, params, route, privilege, entityName } = props;
  return entity === undefined
    ? undefined
    : (props: { children: (props: ActionPropsConfirm) => JSX.Element }) => {
        return (
          <AuthorizeComponent
            config={{
              privilege: privilege,
              subject: {
                tenantId: Number(params.asId),
                sbeId: isSbePrivilege(privilege) ? Number(params.sbeId) : undefined,
                id: entity.id,
              },
            }}
          >
            <props.children
              icon={BiTrash}
              text="Delete"
              title={`Delete ${entityName}`}
              confirmBody={`This will permanently delete the ${entityName}.`}
              onClick={() =>
                mutation(entity.id).then(() =>
                  navigate({
                    to: route.fullPath,
                    params: (old: any) => old,
                  })
                )
              }
              confirm={true}
            />
          </AuthorizeComponent>
        );
      };
};

export const useEditTenantEntity = (props: {
  route: AnyRoute;
  entity: BaseRow | undefined;
  params: { asId: string; sbeId?: string | undefined };
  entityName: string;
  privilege: TenantBasePrivilege | TenantSbePrivilege;
}) => {
  const navigate = useNavigate();
  const { params, route, entity, privilege } = props;
  const path = route.fullPath;
  return entity === undefined
    ? undefined
    : (props: { children: (props: LinkActionProps) => JSX.Element }) => {
        const toOptions = {
          to: path,
          params: (old: any) => ({
            ...old,
            ...params,
          }),
          search: { edit: true },
        };
        return (
          <AuthorizeComponent
            config={{
              privilege: privilege,
              subject: {
                tenantId: Number(params.asId),
                sbeId: isSbePrivilege(privilege) ? Number(params.sbeId) : undefined,
                id: entity.id,
              },
            }}
          >
            <props.children
              icon={BiEdit}
              text="Edit"
              title={'Edit ' + entity.displayName}
              to={toOptions}
              onClick={() => navigate(toOptions)}
            />
          </AuthorizeComponent>
        );
      };
};

export const useReadTenantEntity = (props: {
  route: AnyRoute;
  entity: BaseRow | undefined;
  params: { asId: string; sbeId?: string | undefined };
  privilege: TenantBasePrivilege | TenantSbePrivilege;
}) => {
  const path = props.route.fullPath;
  const navigate = useNavigate();
  const { params, entity, privilege } = props;

  return entity === undefined
    ? undefined
    : (renderProps: { children: (props: LinkActionProps) => JSX.Element }) => {
        const toOptions = {
          to: path,
          params: (old: any) => ({
            ...old,
            ...params,
          }),
        };
        return (
          <AuthorizeComponent
            config={{
              privilege: privilege,
              subject: {
                tenantId: Number(params.asId),
                sbeId: isSbePrivilege(privilege) ? Number(params.sbeId) : undefined,
                id: entity.id,
              },
            }}
          >
            <renderProps.children
              icon={HiOutlineEye}
              text="View"
              title={'View ' + entity.displayName}
              to={toOptions}
              onClick={() => navigate(toOptions)}
            />
          </AuthorizeComponent>
        );
      };
};
