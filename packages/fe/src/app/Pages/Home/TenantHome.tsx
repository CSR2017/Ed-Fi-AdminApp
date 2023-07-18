import { useParams } from 'react-router-dom';
import { PageTemplate } from '../PageTemplate';
import { SbesCardList } from './SbesCardList';
import { AuthorizeComponent, sbeAuthConfig } from '../../helpers';

export const TenantHome = () => {
  const params = useParams() as { asId: string };
  return (
    <PageTemplate title="Home">
      <AuthorizeComponent config={sbeAuthConfig('__filtered__', params.asId, 'tenant.sbe:read')}>
        <SbesCardList />
      </AuthorizeComponent>
    </PageTemplate>
  );
};
