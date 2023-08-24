import { FormLabel, Link, ListItem, Text, UnorderedList } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useMe } from '../../api';
import { Attribute, AttributeContainer } from '@edanalytics/common-ui';

export const ViewAccount = () => {
  const me = useMe();
  const user = me.data;
  const utmArr = user?.userTenantMemberships ?? [];

  return user ? (
    <>
      <Attribute label="Username" value={user.username} />
      <Attribute label="User role" value={user.role?.displayName} />
      {utmArr.length > 1 ? (
        <AttributeContainer label="Tenants">
          <UnorderedList>
            {utmArr.map((t) => (
              <ListItem key={t.id}>
                <Link as={RouterLink} to={`/as/${t.tenant.id}`}>
                  {t.tenant.displayName}
                </Link>
              </ListItem>
            ))}
          </UnorderedList>
        </AttributeContainer>
      ) : utmArr.length > 0 ? (
        <Attribute label="Tenant" value={utmArr[0].tenant.displayName} />
      ) : null}
    </>
  ) : null;
};
