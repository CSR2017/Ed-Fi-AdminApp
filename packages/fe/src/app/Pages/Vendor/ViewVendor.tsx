import { FormLabel, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { vendorQueries } from '../../api';

export const ViewVendor = () => {
  const params = useParams() as {
    asId: string;
    sbeId: string;
    vendorId: string;
  };
  const vendor = vendorQueries.useOne({
    id: params.vendorId,
    sbeId: params.sbeId,
    tenantId: params.asId,
  }).data;

  return vendor ? (
    <>
      <FormLabel as="p">Company</FormLabel>
      <Text>{vendor.company}</Text>
      <FormLabel as="p">Namespace</FormLabel>
      <Text>{vendor.namespacePrefixes === '' ? '-' : vendor.namespacePrefixes}</Text>
      <FormLabel as="p">Contact</FormLabel>
      <Text>{vendor.contactName}</Text>
      {vendor.contactEmailAddress ? (
        <Text href={`mailto:${vendor.contactEmailAddress}`} as="a">
          {vendor.contactEmailAddress}
        </Text>
      ) : null}
    </>
  ) : null;
};
