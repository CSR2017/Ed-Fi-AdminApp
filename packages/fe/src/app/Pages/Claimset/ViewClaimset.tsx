import { Attribute, AttributesGrid, ContentSection } from '@edanalytics/common-ui';
import { useParams } from 'react-router-dom';
import { claimsetQueries } from '../../api';
import { Tooltip } from '@chakra-ui/react';

export const ViewClaimset = () => {
  const params = useParams() as {
    asId: string;
    sbeId: string;
    claimsetId: string;
  };
  const claimset = claimsetQueries.useOne({
    id: params.claimsetId,
    sbeId: params.sbeId,
    tenantId: params.asId,
  }).data;

  return claimset ? (
    <ContentSection>
      <AttributesGrid>
        <Tooltip hasArrow label="System-reserved claimsets cannot be used to create applications.">
          <Attribute label="Is system-reserved" value={claimset.isSystemReserved ?? false} />
        </Tooltip>
        <Attribute label="Applications" value={claimset.applicationsCount} />
      </AttributesGrid>
    </ContentSection>
  ) : null;
};
