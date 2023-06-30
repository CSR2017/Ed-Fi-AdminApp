import { Button } from '@chakra-ui/react';
import { BiEdit } from 'react-icons/bi';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { vendorQueries } from '../../api';
import { AuthorizeComponent, useNavToParent } from '../../helpers';
import { PageTemplate } from '../PageTemplate';
import { EditVendor } from './EditVendor';
import { ViewVendor } from './ViewVendor';
import { useSearchParamsObject } from '../../helpers/useSearch';

export const VendorPage = () => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();

  const params = useParams() as {
    asId: string;
    sbeId: string;
    vendorId: string;
  };
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
  const { edit } = useSearchParamsObject() as { edit?: boolean };

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
                navigate(
                  `as/${params.asId}/sbes/${params.sbeId}/vendors/${params.vendorId}?edit=true`
                );
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
