import { FormLabel, Link, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import {
  applicationQueries,
  claimsetQueries,
  edorgQueries,
  sbeQueries,
  vendorQueries,
} from '../../api';
import { ClaimsetLink, EdorgLink, VendorLink } from '../../routes';
import { GetApplicationDto } from '@edanalytics/models';

export const ViewApplication = () => {
  const params = useParams() as {
    asId: string;
    sbeId: string;
    applicationId: string;
  };
  const application = applicationQueries.useOne({
    id: params.applicationId,
    sbeId: params.sbeId,
    tenantId: params.asId,
  }).data;

  const sbe = sbeQueries.useOne({
    tenantId: params.asId,
    id: params.sbeId,
  });

  const edorgs = edorgQueries.useAll({
    tenantId: params.asId,
    sbeId: params.sbeId,
  });
  const vendors = vendorQueries.useAll({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  const claimsets = claimsetQueries.useAll({
    tenantId: params.asId,
    sbeId: params.sbeId,
  });

  const edorgByEdorgId = Object.values(edorgs.data ?? {}).find(
    (e) =>
      e.educationOrganizationId === application?.educationOrganizationId &&
      (application?.odsInstanceName === null ||
        e.odsDbName === 'EdFi_Ods_' + application?.odsInstanceName)
  );
  const claimsetByName = Object.values(claimsets.data ?? {}).find(
    (e) => e.name === application?.claimSetName
  );

  const url =
    application && edorgByEdorgId && sbe.data?.configPublic?.edfiHostname
      ? GetApplicationDto.apiUrl(
          edorgByEdorgId,
          sbe.data?.configPublic?.edfiHostname,
          application.applicationName
        )
      : undefined;

  return application ? (
    <>
      <FormLabel as="p">Application name</FormLabel>
      <Text>{application.displayName}</Text>
      <FormLabel as="p">Ed-org</FormLabel>
      <EdorgLink id={edorgByEdorgId?.id} query={edorgs} />
      <FormLabel as="p">Vendor</FormLabel>
      <VendorLink id={application?.vendorId} query={vendors} />
      <FormLabel as="p">Claimset</FormLabel>
      <ClaimsetLink id={claimsetByName?.id} query={claimsets} />
      <FormLabel as="p">URL</FormLabel>

      {url ? <Link href={url}>{url}</Link> : <Text>-</Text>}
    </>
  ) : null;
};
