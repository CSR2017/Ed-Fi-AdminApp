import { Button } from '@chakra-ui/react';
import { ConfirmAction } from '@edanalytics/common-ui';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { tenantQueries } from '../../api';
import { useNavToParent } from '../../helpers';
import { PageTemplate } from '../PageTemplate';
import { EditTenant } from './EditTenant';
import { ViewTenant } from './ViewTenant';
import { useSearchParamsObject } from '../../helpers/useSearch';

export const TenantPage = () => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();

  const params = useParams() as { tenantId: string };
  const deleteTenant = tenantQueries.useDelete({
    callback: () => {
      navigate(navToParentOptions);
    },
  });
  const tenant = tenantQueries.useOne({
    id: params.tenantId,
  }).data;
  const { edit } = useSearchParamsObject() as { edit?: boolean };

  return (
    <PageTemplate
      title={tenant?.displayName || 'Tenant'}
      actions={
        tenant ? (
          <>
            <Button
              isDisabled={edit}
              leftIcon={<BiEdit />}
              onClick={() => {
                navigate(`tenants/${params.tenantId}?edit=true`);
              }}
            >
              Edit
            </Button>
            <ConfirmAction
              action={() => deleteTenant.mutate(tenant.id)}
              headerText={`Delete ${tenant.displayName}?`}
              bodyText="You won't be able to get it back"
            >
              {(props) => (
                <Button {...props} leftIcon={<BiTrash />}>
                  Delete
                </Button>
              )}
            </ConfirmAction>
          </>
        ) : null
      }
      constrainWidth
    >
      {tenant ? edit ? <EditTenant /> : <ViewTenant /> : null}
    </PageTemplate>
  );
};
