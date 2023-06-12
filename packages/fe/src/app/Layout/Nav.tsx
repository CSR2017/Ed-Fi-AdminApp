import { Box, Select, Text, chakra, useBoolean } from '@chakra-ui/react';
import { useNavigate, useParams, useRouter } from '@tanstack/router';
import Cookies from 'js-cookie';
import { Resizable } from 're-resizable';
import { useEffect, useState } from 'react';
import { BsPerson, BsPersonFill } from 'react-icons/bs';
import { useMe, useMyTenants } from '../api';
import { accountRouteGlobal, asRoute } from '../routes';
import { GlobalNav } from './GlobalNav';
import { NavButton } from './NavButton';
import { TenantNav } from './TenantNav';
import { AuthorizeComponent } from '../helpers';

export const Nav = () => {
  const params = useParams({ from: asRoute.id });
  const defaultTenant: any = params?.asId ?? Cookies.get('defaultTenant');
  const [tenantId, setTenantId] = useState(
    typeof defaultTenant === 'string' && defaultTenant !== 'undefined'
      ? Number(defaultTenant)
      : undefined
  );
  const me = useMe();
  const tenants = useMyTenants();
  const router = useRouter();
  const navigate = useNavigate();

  useEffect(() => {
    Cookies.set('defaultTenant', String(tenantId));
  }, [tenantId]);

  useEffect(() => {
    if (
      String(tenantId) !== params.asId &&
      router.state.currentMatches.map((m) => m.route.id).includes(asRoute.id)
    ) {
      setTenantId(Number(params.asId));
    }
  }, [tenantId, router.state.currentMatches, navigate, params.asId]);

  const [isResizing, setIsResizing] = useBoolean(false);

  return (
    <Box
      py={3}
      flex="0 0 15em"
      overflowX="hidden"
      overflowY="auto"
      bg="rgb(248,248,248)"
      borderRight="1px solid"
      borderColor="gray.200"
      enable={{ right: true }}
      defaultSize={{ width: '15em', height: '100%' }}
      onResizeStart={setIsResizing.on}
      onResizeStop={setIsResizing.off}
      borderRightWidth={isResizing ? '3px' : undefined}
      borderRightColor={isResizing ? 'teal.500' : undefined}
      minWidth="5em"
      maxWidth="min(40em, 80%)"
      as={Resizable}
    >
      {Object.keys(tenants.data ?? {}).length > 1 ? (
        <Box px={3}>
          <Select
            bg="white"
            mb={3}
            value={String(tenantId)}
            css={
              tenantId === undefined
                ? { fontStyle: 'italic', color: 'gray.500' }
                : undefined
            }
            onChange={(e) => {
              const value = e.target.value;
              const newTenantId =
                value === 'undefined' ? undefined : Number(value);
              if (
                newTenantId !== undefined &&
                router.state.currentMatches
                  .map((m) => m.route.id)
                  .includes(asRoute.id)
              ) {
                navigate({
                  to: asRoute.fullPath,
                  params: (old: any) => ({ ...old, asId: String(newTenantId) }),
                });
              } else {
                if (
                  router.state.currentMatches
                    .map((m) => m.route.id)
                    .includes(asRoute.id)
                ) {
                  navigate({ to: '/' }).then(() => {
                    setTenantId(newTenantId);
                  });
                } else {
                  setTenantId(newTenantId);
                }
              }
            }}
          >
            {Object.values(tenants.data ?? {})
              .sort((a, b) => Number(a.displayName > b.displayName) - 0.5)
              .map((t) => (
                <chakra.option fontStyle="normal" key={t.id} value={t.id}>
                  {t.displayName}
                </chakra.option>
              ))}
            <chakra.option
              color="gray.500"
              fontStyle="italic"
              value={'undefined'}
            >
              None
            </chakra.option>
          </Select>
        </Box>
      ) : null}
      <Text px={3} as="h3" color="gray.500" mb={2} fontWeight="600">
        Pages
      </Text>
      <NavButton
        {...{
          route: accountRouteGlobal,
          icon: BsPerson,
          activeIcon: BsPersonFill,
          text: 'Account',
          isActive: router.state.currentMatches
            .map((m) => m.route.id)
            .includes(accountRouteGlobal.id),
        }}
      />
      {tenantId === undefined ? (
        <AuthorizeComponent
          config={{
            privilege: 'sbe:read',
            subject: {
              id: '__filtered__',
            },
          }}
        >
          <GlobalNav />
        </AuthorizeComponent>
      ) : (
        <AuthorizeComponent
          config={{
            privilege: 'tenant.sbe:read',
            subject: {
              tenantId,
              id: '__filtered__',
            },
          }}
        >
          <TenantNav tenantId={String(tenantId)} />
        </AuthorizeComponent>
      )}
    </Box>
  );
};
