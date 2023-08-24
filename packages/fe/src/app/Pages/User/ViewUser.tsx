import { FormLabel, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { userQueries } from '../../api';
import { Attribute } from '@edanalytics/common-ui';

export const ViewUser = () => {
  const params = useParams() as {
    asId: string;
    userId: string;
  };
  const user = userQueries.useOne({
    id: params.userId,
    tenantId: params.asId,
  }).data;

  return user ? (
    <>
      <Attribute label="Given Name" value={user.givenName} />
      <Attribute label="Family Name" value={user.familyName} />
      <Attribute isCopyable label="Username" value={user.username} />
    </>
  ) : null;
};
