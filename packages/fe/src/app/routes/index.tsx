import { Box, ListItem, Text, UnorderedList } from '@chakra-ui/react';
import { memo, useEffect } from 'react';
import { RouteObject, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ErrorFallback } from '../Layout/Fallback404';
import { PublicAppLayout } from '../Layout/PublicAppLayout';
import { StandardLayout } from '../Layout/StandardLayout';
import { TenantHome } from '../Pages/Home/TenantHome';
import { useSearchParamsObject } from '../helpers/useSearch';
import { accountRouteGlobal } from './account.routes';
import {
  applicationCreateRoute,
  applicationIndexRoute,
  applicationRoute,
  applicationsIndexRoute,
  applicationsRoute,
} from './application.routes';
import {
  claimsetIndexRoute,
  claimsetRoute,
  claimsetsIndexRoute,
  claimsetsRoute,
} from './claimset.routes';
import { edorgIndexRoute, edorgRoute, edorgsIndexRoute, edorgsRoute } from './edorg.routes';
import { odsIndexRoute, odsRoute, odssIndexRoute, odssRoute } from './ods.routes';
import {
  ownershipGlobalCreateRoute,
  ownershipGlobalIndexRoute,
  ownershipGlobalRoute,
  ownershipsGlobalIndexRoute,
  ownershipsGlobalRoute,
} from './ownership-global.routes';
import {
  ownershipIndexRoute,
  ownershipRoute,
  ownershipsIndexRoute,
  ownershipsRoute,
} from './ownership.routes';
import {
  roleGlobalCreateRoute,
  roleGlobalIndexRoute,
  roleGlobalRoute,
  rolesGlobalIndexRoute,
  rolesGlobalRoute,
} from './role-global.routes';
import { roleIndexRoute, roleRoute, rolesIndexRoute, rolesRoute } from './role.routes';
import {
  sbeGlobalCreateRoute,
  sbeGlobalIndexRoute,
  sbeGlobalRoute,
  sbesGlobalIndexRoute,
  sbesGlobalRoute,
} from './sbe-global.routes';
import { sbeIndexRoute, sbeRoute, sbesIndexRoute, sbesRoute } from './sbe.routes';
import { secretRoute } from './secret.routes';
import {
  tenantCreateRoute,
  tenantIndexRoute,
  tenantRoute,
  tenantsIndexRoute,
  tenantsRoute,
} from './tenant.routes';
import { userIndexRoute, userRoute, usersIndexRoute, usersRoute } from './user.routes';
import { vendorIndexRoute, vendorRoute, vendorsIndexRoute, vendorsRoute } from './vendor.routes';
import {
  usersGlobalRoute,
  usersGlobalIndexRoute,
  userGlobalRoute,
  userGlobalIndexRoute,
  userGlobalCreateRoute,
} from './user-global.routes';
export * from './account.routes';
export * from './application.routes';
export * from './claimset.routes';
export * from './edorg.routes';
export * from './ods.routes';
export * from './ownership-global.routes';
export * from './ownership.routes';
export * from './role.routes';
export * from './sbe-global.routes';
export * from './sbe.routes';
export * from './tenant.routes';
export * from './user.routes';
export * from './user-global.routes';
export * from './vendor.routes';

export const fallback404Route: RouteObject = {
  path: '*',
  element: <ErrorFallback />,
};

export const indexRoute: RouteObject = {
  path: '/',
};
export const publicRoute: RouteObject = {
  path: '/public',
  element: (
    <Box p="5em">
      <Text
        background="linear-gradient(45deg, var(--chakra-colors-blue-700), var(--chakra-colors-teal-600))"
        backgroundClip="text"
        textColor="transparent"
        fontWeight="black"
        fontSize="6xl"
      >
        Starting Blocks drives synergies to increase profits and deliver value for your private
        equity overlords.
      </Text>
      <UnorderedList color="teal.600" mt="2em" fontSize="3xl" fontWeight="bold">
        <ListItem>Productivity feature.</ListItem>
        <ListItem>More insights. More actionable.</ListItem>
        <ListItem>Strategic.</ListItem>
        <ListItem>Efficiency feature.</ListItem>
        <ListItem>Complete business solution.</ListItem>
      </UnorderedList>
    </Box>
  ),
};
const Login = memo(() => {
  const { redirect } = useSearchParamsObject();
  useEffect(() => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/oidc/1/login${
      redirect ? `?redirect=${redirect}` : ''
    }`;
  }, []);
  return null;
});
export const loginRoute: RouteObject = {
  path: '/login',
  element: <Login />,
  errorElement: <ErrorFallback />,
};
export const asRoute: RouteObject = {
  path: '/as/:asId',
  element: <TenantHome />,
};
export const publicLayoutRoute: RouteObject = {
  element: <PublicAppLayout />,
  errorElement: <ErrorFallback />,
  children: [publicRoute, secretRoute],
};
export const mainLayoutRoute: RouteObject = {
  element: <StandardLayout />,
  errorElement: <ErrorFallback />,
  handle: { crumb: () => 'Home' },
  children: [
    indexRoute,

    sbesGlobalRoute,
    sbesGlobalIndexRoute,
    sbeGlobalCreateRoute,
    sbeGlobalRoute,
    sbeGlobalIndexRoute,

    rolesGlobalRoute,
    rolesGlobalIndexRoute,
    roleGlobalCreateRoute,
    roleGlobalRoute,
    roleGlobalIndexRoute,

    usersGlobalRoute,
    usersGlobalIndexRoute,
    userGlobalCreateRoute,
    userGlobalRoute,
    userGlobalIndexRoute,

    ownershipsGlobalRoute,
    ownershipsGlobalIndexRoute,
    ownershipGlobalRoute,
    ownershipGlobalIndexRoute,
    ownershipGlobalCreateRoute,

    sbesRoute,
    sbesIndexRoute,
    sbeRoute,
    sbeIndexRoute,

    odssRoute,
    odssIndexRoute,
    odsRoute,
    odsIndexRoute,

    rolesRoute,
    rolesIndexRoute,
    roleRoute,
    roleIndexRoute,

    tenantsRoute,
    tenantsIndexRoute,
    tenantRoute,
    tenantIndexRoute,
    tenantCreateRoute,

    usersRoute,
    usersIndexRoute,
    userRoute,
    userIndexRoute,

    ownershipsRoute,
    ownershipsIndexRoute,
    ownershipRoute,
    ownershipIndexRoute,

    edorgsRoute,
    edorgsIndexRoute,
    edorgRoute,
    edorgIndexRoute,

    claimsetsRoute,
    claimsetsIndexRoute,
    claimsetRoute,
    claimsetIndexRoute,

    applicationsRoute,
    applicationsIndexRoute,
    applicationRoute,
    applicationIndexRoute,
    applicationCreateRoute,

    vendorsRoute,
    vendorsIndexRoute,
    vendorRoute,
    vendorIndexRoute,

    asRoute,
    accountRouteGlobal,
  ],
};
export const routes = [mainLayoutRoute, publicLayoutRoute, loginRoute, fallback404Route];
const addPathToHandle = (r: RouteObject) => {
  r.handle = {
    ...r.handle,
    path: r.path,
  };
  r.children?.forEach((route) => addPathToHandle(route));
};
routes.forEach(addPathToHandle);
const flattenRoute = (r: RouteObject): RouteObject[] =>
  [r, ...(r.children ?? []).map((route) => flattenRoute(route))].flat();
const router = createBrowserRouter(routes);
export const flatRoutes = routes.flatMap(flattenRoute);
export const Routes = () => {
  return <RouterProvider router={router} />;
};
