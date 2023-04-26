import { Heading } from '@chakra-ui/react';
import {
  RootRoute,
  Route,
  Router,
  RouterProvider,
  useNavigate,
  useSearch,
} from '@tanstack/router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import axios from 'axios';
import { memo, useEffect } from 'react';
import { environment } from '../../environments/environment.local';
import { StandardLayout } from '../Layout/StandardLayout';
import { accountRoute } from './account.routes';
import {
  userIndexRoute,
  userRoute,
  usersIndexRoute,
  usersRoute,
} from './user.routes';
export * from './account.routes';
export * from './user.routes';

export const rootRoute = new RootRoute();

export const mainLayoutRoute = new Route({
  getParentRoute: () => rootRoute,
  id: 'main-layout',
  component: StandardLayout,
  getContext: ({ params }) => ({
    breadcrumb: () => ({ title: () => 'Home', params }),
  }),
});

export const indexRoute = new Route({
  getParentRoute: () => mainLayoutRoute,
  path: '/',
  component: () => (
    <Heading mb={4} fontSize="lg">
      Home
    </Heading>
  ),
});

export const publicRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/public',
  component: () => <a href="/login">Login</a>,
});

const Login = memo(() => {
  const { redirect } = useSearch({ from: loginRoute.id });
  useEffect(() => {
    window.location.href = `http://localhost:3333/api/auth/oidc/login${
      redirect ? `?redirect=${redirect}` : ''
    }`;
  }, []);
  return null;
});

export const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'login',
  component: Login,
  validateSearch: (search): { redirect?: string } =>
    typeof search.redirect === 'string'
      ? { redirect: decodeURIComponent(search.redirect) }
      : {},
});

const routeTree = rootRoute.addChildren([
  publicRoute,
  loginRoute,
  mainLayoutRoute.addChildren([
    indexRoute,
    accountRoute,
    usersRoute.addChildren([
      usersIndexRoute,
      userRoute.addChildren([userIndexRoute]),
    ]),
  ]),
]);

// Create the router using your route tree
export const router = new Router({ routeTree });

export const Routes = () => (
  <>
    <RouterProvider router={router} />
    {environment.production ? null : (
      <TanStackRouterDevtools position="bottom-right" router={router} />
    )}
  </>
);
