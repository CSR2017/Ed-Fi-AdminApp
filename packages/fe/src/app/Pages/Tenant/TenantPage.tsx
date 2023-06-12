import { Box, Button, ButtonGroup, Heading } from '@chakra-ui/react';
import { ActionGroup, ConfirmAction } from '@edanalytics/common-ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useSearch } from '@tanstack/router';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { tenantQueries, userQueries } from '../../api';
import { tenantIndexRoute } from '../../routes';
import { useNavToParent } from '../../helpers';
import { EditTenant } from './EditTenant';
import { ViewTenant } from './ViewTenant';
import { ReactNode } from 'react';
import { PageTemplate } from '../PageTemplate';

export const TenantPage = (): ReactNode => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();

  const params = useParams({ from: tenantIndexRoute.id });
  const deleteTenant = tenantQueries.useDelete({
    callback: () => {
      navigate(navToParentOptions);
    },
  });
  const tenant = tenantQueries.useOne({
    id: params.tenantId,
  }).data;
  const { edit } = useSearch({ from: tenantIndexRoute.id });

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
                navigate({
                  search: { edit: true },
                });
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
