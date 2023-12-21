import {
  Attribute,
  AttributeContainer,
  AttributesGrid,
  ContentSection,
  CopyButton,
} from '@edanalytics/common-ui';
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
    <ContentSection>
      <AttributesGrid>
        <Attribute label="Id" value={vendor.vendorId} isCopyable />
        <Attribute label="Company" value={vendor.company} />
        <Attribute label="Contact" value={vendor.contactName} />
        {vendor.contactEmailAddress ? (
          <Attribute
            label="Contact email"
            value={`mailto:${vendor.contactEmailAddress}`}
            isUrl
            isUrlExternal
            isCopyable
          />
        ) : null}
        <AttributeContainer label="Namespace">
          {vendor.namespacePrefixes === ''
            ? '-'
            : vendor.namespacePrefixes.split(/,\s*/g).map((ns) => (
                <p key={ns}>
                  <CopyButton value={ns} />
                  {ns}
                </p>
              ))}
        </AttributeContainer>
      </AttributesGrid>
    </ContentSection>
  ) : null;
};
