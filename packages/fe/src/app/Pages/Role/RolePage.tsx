import { Box, Button, ButtonGroup, Heading } from '@chakra-ui/react';
import { ActionGroup, ConfirmAction } from '@edanalytics/common-ui';
import { useNavigate, useParams, useSearch } from '@tanstack/router';
import { ReactNode } from 'react';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { roleQueries } from '../../api';
import {
  AuthorizeComponent,
  tenantRoleAuthConfig,
  useNavToParent,
} from '../../helpers';
import { roleIndexRoute } from '../../routes';
import { EditRole } from './EditRole';
import { ViewRole } from './ViewRole';
import { PageTemplate } from '../PageTemplate';

export const RolePage = (): ReactNode => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();

  const params = useParams({ from: roleIndexRoute.id });
  const deleteRole = roleQueries.useDelete({
    callback: () => {
      navigate(navToParentOptions);
    },
    tenantId: params.asId,
  });
  const role = roleQueries.useOne({
    id: params.roleId,
    tenantId: params.asId,
  }).data;
  const { edit } = useSearch({ from: roleIndexRoute.id });

  return (
    <PageTemplate
      constrainWidth
      title={role?.displayName || 'Role'}
      actions={
        role ? (
          <>
            <AuthorizeComponent
              config={tenantRoleAuthConfig(
                role.id,
                role.tenantId,
                'tenant.role:update'
              )}
            >
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
            </AuthorizeComponent>
            <AuthorizeComponent
              config={tenantRoleAuthConfig(
                role.id,
                role.tenantId,
                'tenant.role:delete'
              )}
            >
              <ConfirmAction
                action={() => deleteRole.mutate(role.id)}
                headerText={`Delete ${role.displayName}?`}
                bodyText="You won't be able to get it back"
              >
                {(props) => (
                  <Button {...props} leftIcon={<BiTrash />}>
                    Delete
                  </Button>
                )}
              </ConfirmAction>
            </AuthorizeComponent>
          </>
        ) : null
      }
    >
      {role ? edit ? <EditRole /> : <ViewRole /> : null}
    </PageTemplate>
  );
};
