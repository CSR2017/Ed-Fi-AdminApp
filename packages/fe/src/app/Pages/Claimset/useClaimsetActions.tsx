import { GetClaimsetDto } from '@edanalytics/models';
import { HiOutlineEye } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { ActionsType, AuthorizeComponent, LinkActionProps } from '../../helpers';

export const useClaimsetActions = ({
  claimset,
  sbeId,
  tenantId,
}: {
  claimset: GetClaimsetDto | undefined;
  sbeId: string;
  tenantId: string;
}): ActionsType => {
  const navigate = useNavigate();
  const to = (id: number | string) => `/as/${tenantId}/sbes/${sbeId}/claimsets/${id}`;

  return claimset
    ? {
        View: (props: { children: (props: LinkActionProps) => JSX.Element }) => {
          const path = to(claimset.id);
          return (
            <AuthorizeComponent
              config={{
                privilege: 'tenant.sbe.claimset:read',
                subject: {
                  sbeId: Number(sbeId),
                  tenantId: Number(tenantId),
                  id: claimset.id,
                },
              }}
            >
              <props.children
                icon={HiOutlineEye}
                text="View"
                title={'View ' + claimset.displayName}
                to={path}
                onClick={() => navigate(path)}
              />
            </AuthorizeComponent>
          );
        },
      }
    : {};
};
