import { Box, Text, useBoolean } from '@chakra-ui/react';
import { GetTenantDto } from '@edanalytics/models';
import { useQueryClient } from '@tanstack/react-query';
import { Select } from 'chakra-react-select';
import { atom, useAtom } from 'jotai';
import Cookies from 'js-cookie';
import { Resizable } from 're-resizable';
import { useEffect, useMemo } from 'react';
import { BsHouseDoor, BsHouseDoorFill, BsPerson, BsPersonFill } from 'react-icons/bs';
import { useLocation, useMatches, useNavigate, useParams } from 'react-router-dom';
import { useMyTenants } from '../api';
import {
  authCacheKey,
  authorize,
  globalOwnershipAuthConfig,
  globalSbeAuthConfig,
  globalTenantAuthConfig,
  globalUserAuthConfig,
  usePrivilegeCacheForConfig,
} from '../helpers';
import { GlobalNav } from './GlobalNav';
import { NavButton } from './NavButton';
import { TenantNav } from './TenantNav';

const parseDefaultTenant = (defaultTenant: string | undefined) => {
  const num = Number(defaultTenant);
  return !isNaN(num) ? num : undefined;
};

export const asTenantIdAtom = atom<number | undefined>(undefined);

export const Nav = () => {
  const [isResizing, setIsResizing] = useBoolean(false);

  const tenants = useMyTenants();
  const queryClient = useQueryClient();
  const globalAuthConfigs = [
    globalTenantAuthConfig('tenant:read')!,
    globalOwnershipAuthConfig('ownership:read')!,
    globalUserAuthConfig('user:read')!,
    globalSbeAuthConfig('__filtered__', 'sbe:read')!,
  ];
  usePrivilegeCacheForConfig(globalAuthConfigs);

  const hasGlobalPrivileges = globalAuthConfigs.some((config) =>
    authorize({
      queryClient,
      config,
    })
  )
    ? true
    : globalAuthConfigs.every(
        (config) => queryClient.getQueryState(authCacheKey(config))?.status === 'success'
      )
    ? false
    : // not done loading yet
      undefined;

  return (
    <Box
      pb={3}
      pt={8}
      flex="0 0 20em"
      overflowX="hidden"
      overflowY="auto"
      bg="foreground-bg"
      enable={{ right: true }}
      defaultSize={{ width: '15em', height: '100%' }}
      onResizeStart={setIsResizing.on}
      onResizeStop={setIsResizing.off}
      borderRightWidth={isResizing ? '3px' : undefined}
      borderRightColor={isResizing ? 'teal.500' : undefined}
      minWidth="11em"
      maxWidth="min(40em, 80%)"
      as={Resizable}
    >
      {tenants.data && hasGlobalPrivileges !== undefined ? (
        <NavContent tenants={tenants.data} hasGlobalPrivileges={hasGlobalPrivileges} />
      ) : (
        <Text px={3}>...Loading</Text>
      )}
    </Box>
  );
};

const NavContent = ({
  tenants,
  hasGlobalPrivileges,
}: {
  tenants: Record<GetTenantDto['id'], GetTenantDto>;
  hasGlobalPrivileges: boolean;
}) => {
  const params = useParams() as { asId?: string };

  const defaultTenant = parseDefaultTenant(params?.asId ?? Cookies.get('defaultTenant'));

  const [tenantId, _setTenantId] = useAtom(asTenantIdAtom);
  const currentMatches = useMatches();
  const path = useLocation().pathname;

  const navigate = useNavigate();

  const selectedTenant = tenantId === undefined ? undefined : tenants?.[tenantId];
  const tenantsCount = Object.keys(tenants).length;
  const firstTenantId: string | undefined = Object.keys(tenants)?.[0];

  const setTenantId = useMemo(() => {
    return (newTenantId: number | undefined) => {
      if (newTenantId === undefined) {
        if (params.asId) {
          navigate('/');
        }
        _setTenantId(undefined);
      } else {
        if (newTenantId in tenants) {
          _setTenantId(newTenantId);
          if (params.asId !== String(newTenantId)) {
            navigate(`/as/${newTenantId}`);
          }
        } else {
          if (params.asId) {
            navigate('/');
          }
          _setTenantId(undefined);
        }
      }
    };
  }, [_setTenantId, tenants, params, navigate]);

  // Set initial tenantId
  useEffect(() => {
    setTenantId(
      defaultTenant !== undefined && defaultTenant in tenants ? defaultTenant : undefined
    );
  }, []);

  // Keep cookie in sync with JS state
  useEffect(() => {
    Cookies.set('defaultTenant', String(tenantId));
  }, [tenantId]);

  useEffect(() => {
    if (
      // if we're on a tenant route
      params.asId &&
      // and tenant state isn't synced with it yet
      String(tenantId) !== params.asId
    ) {
      // then sync it up
      setTenantId(Number(params.asId));
    }
  }, [tenantId, currentMatches, setTenantId, params.asId]);

  useEffect(() => {
    if (
      // if you only have one tenant
      tenantsCount === 1 &&
      // and you don't have any global privileges
      !hasGlobalPrivileges &&
      // and your tenant isn't already set
      tenantId === undefined
    ) {
      // then set it
      setTenantId(Number(firstTenantId));
    }
  }, [tenantsCount, firstTenantId, hasGlobalPrivileges, tenantId, setTenantId]);

  return (
    <>
      {Object.keys(tenants).length > 1 || hasGlobalPrivileges ? (
        <Box mb={7} px={3}>
          <Select
            aria-label="Select a tenant (or global) context"
            value={
              selectedTenant === undefined
                ? {
                    label: 'No tenant (global)',
                    value: undefined,
                    styles: {
                      fontWeight: '600',
                      color: 'gray.600',
                      fontSize: 'md',
                    },
                  }
                : {
                    label: selectedTenant.displayName,
                    value: selectedTenant.id,
                  }
            }
            onChange={(option) => {
              const value = option?.value ?? undefined;
              const newTenantId = value === undefined ? undefined : Number(value);
              setTenantId(newTenantId);
            }}
            options={[
              {
                label: 'No tenant (global)',
                value: undefined,
                styles: {
                  fontWeight: '600',
                  color: 'gray.600',
                  fontSize: 'md',
                },
              },
              ...Object.values(tenants)
                .sort((a, b) => Number(a.displayName > b.displayName) - 0.5)
                .map((t) => ({
                  label: t.displayName,
                  value: t.id,
                })),
            ]}
            selectedOptionStyle="check"
            chakraStyles={{
              option: (styles, { data, isDisabled, isFocused, isSelected }) => {
                return {
                  ...styles,
                  ...data?.styles,
                };
              },
              singleValue: (styles, { data, isDisabled }) => {
                return {
                  ...styles,
                  ...data?.styles,
                };
              },
              container: (styles) => ({
                ...styles,
                bg: 'transparent',
                borderRadius: 'md',
                zIndex: 3,
              }),
              dropdownIndicator: (styles) => ({
                ...styles,
                bg: 'none',
                width: '1.5em',
              }),
              indicatorSeparator: (styles) => ({
                ...styles,
                borderColor: 'transparent',
              }),
            }}
          />
        </Box>
      ) : null}
      <NavButton
        {...{
          route: '/',
          icon: BsHouseDoor,
          activeIcon: BsHouseDoorFill,
          text: 'Home',
          isActive: /^\/(as\/\d+\/?)?$/.test(path),
        }}
      />
      <NavButton
        {...{
          route: '/account',
          icon: BsPerson,
          activeIcon: BsPersonFill,
          text: 'Account',
          isActive: currentMatches.some((m) => m.pathname.startsWith('/account')),
        }}
      />
      {tenantId === undefined ? <GlobalNav /> : <TenantNav tenantId={String(tenantId)} />}
    </>
  );
};
