import { useParams } from 'react-router-dom';
import { vendorQueries } from '../../api';
import { useSearchParamsObject } from '../../helpers/useSearch';
import { PageTemplate } from '../../Layout/PageTemplate';
import { EditVendor } from './EditVendor';
import { ViewVendor } from './ViewVendor';
import { ErrorBoundary } from 'react-error-boundary';

export const VendorPageContent = () => {
  const params = useParams() as {
    asId: string;
    sbeId: string;
    vendorId: string;
  };
  const vendor = vendorQueries.useOne({
    tenantId: params.asId,
    id: params.vendorId,
    sbeId: params.sbeId,
  }).data;
  const { edit } = useSearchParamsObject() as { edit?: boolean };

  return vendor ? edit ? <EditVendor /> : <ViewVendor /> : null;
};

const VendorPageTitle = () => {
  const params = useParams() as {
    asId: string;
    sbeId: string;
    vendorId: string;
  };
  const vendor = vendorQueries.useOne({
    tenantId: params.asId,
    id: params.vendorId,
    sbeId: params.sbeId,
  }).data;
  return <>{vendor?.company || 'Vendor'}</>;
};

export const VendorPage = () => {
  return (
    <PageTemplate
      constrainWidth
      title={
        <ErrorBoundary fallbackRender={() => 'Vendor'}>
          <VendorPageTitle />
        </ErrorBoundary>
      }
    >
      <VendorPageContent />
    </PageTemplate>
  );
};
