import { FormLabel, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { ownershipQueries, roleQueries, tenantQueries } from '../../api';
import { getRelationDisplayName } from '../../helpers';
import { TenantLink } from '../../routes';

export const ViewOwnershipGlobal = () => {
  const params = useParams() as {
    ownershipId: string;
  };
  const ownership = ownershipQueries.useOne({
    id: params.ownershipId,
  }).data;
  const tenants = tenantQueries.useAll({});
  const roles = roleQueries.useAll({});

  return ownership ? (
    <>
      <FormLabel as="p">Tenant</FormLabel>
      <TenantLink id={ownership.tenantId} query={tenants} />
      <FormLabel as="p">Resource</FormLabel>
      <Text>
        {ownership.edorg
          ? ownership.edorg.displayName
          : ownership.ods
          ? ownership.ods.displayName
          : ownership.sbe
          ? ownership.sbe.displayName
          : '-'}
      </Text>
      <FormLabel as="p">Role</FormLabel>
      <Text>{getRelationDisplayName(ownership.roleId, roles)}</Text>
    </>
  ) : null;
};
