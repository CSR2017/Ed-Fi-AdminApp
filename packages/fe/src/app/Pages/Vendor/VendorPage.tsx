import { Box, Button, ButtonGroup, Heading } from '@chakra-ui/react';
import { ActionGroup, ConfirmAction } from '@edanalytics/common-ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useSearch } from '@tanstack/router';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { vendorQueries, userQueries } from '../../api';
import { vendorIndexRoute } from '../../routes';
import { AuthorizeComponent, useNavToParent } from '../../helpers';
import { EditVendor } from './EditVendor';
import { ViewVendor } from './ViewVendor';
import { ReactNode } from 'react';
import { PageTemplate } from '../PageTemplate';

export const VendorPage = (): ReactNode => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();

  const params = useParams({ from: vendorIndexRoute.id });
  const tenantId = Number(params.asId);
  const sbeId = Number(params.sbeId);
  const id = Number(params.vendorId);
  const deleteVendor = vendorQueries.useDelete({
    sbeId: params.sbeId,
    tenantId: params.asId,
    callback: () => {
      navigate(navToParentOptions);
    },
  });
  const vendor = vendorQueries.useOne({
    tenantId: params.asId,
    id: params.vendorId,
    sbeId: params.sbeId,
  }).data;
  const { edit } = useSearch({ from: vendorIndexRoute.id });

  return (
    <PageTemplate
      constrainWidth
      title={vendor?.company || 'Vendor'}
      actions={
        vendor ? (
          <AuthorizeComponent
            config={{
              privilege: 'tenant.sbe.vendor:update',
              subject: {
                tenantId,
                sbeId,
                id,
              },
            }}
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
        ) : null
      }
    >
      {vendor ? edit ? <EditVendor /> : <ViewVendor /> : null}
    </PageTemplate>
  );
};
