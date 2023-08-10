import { Heading } from '@chakra-ui/react';
import { AuthorizeComponent, sbeAuthConfig, useNavContext } from '../../helpers';
import { PageTemplate } from '../../Layout/PageTemplate';
import { SbesCardList } from './SbesCardList';

export const TenantHome = () => {
  const asId = useNavContext().asId!;
  return (
    <PageTemplate title="Home">
      <AuthorizeComponent config={sbeAuthConfig('__filtered__', asId, 'tenant.sbe:read')}>
        <>
          <Heading size="md" mb={5} mt={10}>
            StartingBlocks environments
          </Heading>
          <SbesCardList />
        </>
      </AuthorizeComponent>
    </PageTemplate>
  );
};
