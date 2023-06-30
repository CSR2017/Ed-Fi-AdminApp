import { Heading, HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { useParams } from 'react-router-dom';
import { vendorQueries } from '../../api';
import { VendorLink, vendorsRoute } from '../../routes';
import { PageTemplate } from '../PageTemplate';

export const VendorsPage = () => {
  const params = useParams() as { asId: string; sbeId: string };
  const vendors = vendorQueries.useAll({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  const deleteVendor = vendorQueries.useDelete({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });

  return (
    <PageTemplate title="Vendors">
      <DataTable
        data={Object.values(vendors?.data || {})}
        columns={[
          {
            accessorKey: 'company',
            cell: (info) => (
              <HStack justify="space-between">
                <VendorLink id={info.row.original.vendorId} query={vendors} />
                <HStack
                  className="row-hover"
                  color="gray.600"
                  align="middle"
                ></HStack>
              </HStack>
            ),
            header: () => 'Company',
          },
          {
            accessorKey: 'namespacePrefixes',
            header: () => 'Namespace',
          },
          {
            accessorKey: 'contactName',
            header: () => 'Contact',
          },
        ]}
      />
    </PageTemplate>
  );
};
