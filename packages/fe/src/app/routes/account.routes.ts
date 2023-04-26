import { Route } from '@tanstack/router';
import { mainLayoutRoute } from '.';
import { AccountPage } from '../Pages/Account/AccountPage';

export const accountRoute = new Route({
  getParentRoute: () => mainLayoutRoute,
  path: 'account',
  validateSearch: (search): { edit?: boolean } =>
    typeof search.edit === 'boolean' ? { edit: search.edit } : {},
  getContext: ({ params }) => ({
    breadcrumb: () => ({ title: () => 'Account', params }),
  }),
  component: AccountPage,
});
