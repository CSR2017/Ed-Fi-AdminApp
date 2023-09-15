import { ContentSection } from '@edanalytics/common-ui';
import { useParams } from 'react-router-dom';
import { sbeQueries } from '../../api';
import { SbeCardContent } from '../Home/SbeCard';

export const ViewSbe = () => {
  const params = useParams() as {
    asId: string;
    sbeId: string;
  };
  const sbe = sbeQueries.useOne({
    id: params.sbeId,
    tenantId: params.asId,
  }).data;

  return sbe ? <ContentSection>{sbe ? <SbeCardContent sbe={sbe} /> : null}</ContentSection> : null;
};
