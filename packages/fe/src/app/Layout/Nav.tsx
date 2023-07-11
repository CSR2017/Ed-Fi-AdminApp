import { Box, Text, useBoolean } from '@chakra-ui/react';
import { GetTenantDto } from '@edanalytics/models';
import { useQueryClient } from '@tanstack/react-query';
import { Select } from 'chakra-react-select';
import Cookies from 'js-cookie';
import { Resizable } from 're-resizable';
import { useEffect, useState } from 'react';
import { BsPerson, BsPersonFill } from 'react-icons/bs';
import { useMatches, useNavigate, useParams } from 'react-router-dom';
import { useMyTenants } from '../api';
import { AuthorizeComponent, authorize, globalTenantAuthConfig } from '../helpers';
import { GlobalNav } from './GlobalNav';
import { NavButton } from './NavButton';
import { TenantNav } from './TenantNav';

export const Nav = () => {
  const params = useParams();
  const defaultTenant: any = params?.asId ?? Cookies.get('defaultTenant');
  const [tenantId, setTenantId] = useState(
    typeof defaultTenant === 'string' && defaultTenant !== 'undefined' && defaultTenant !== 'NaN'
      ? Number(defaultTenant)
      : undefined
  );
  const tenants = useMyTenants();
  const currentMatches = useMatches();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const tenantAuthConfig = globalTenantAuthConfig('tenant:read');

  const hasGlobalTenantsRead = authorize({
    queryClient,
    config: tenantAuthConfig,
  });
  const selectedTenant = tenantId === undefined ? undefined : tenants.data?.[tenantId];

  useEffect(() => {
    Cookies.set('defaultTenant', String(tenantId));
  }, [tenantId]);

  const isInTenantContext = currentMatches.some((m) => m.pathname.startsWith('/as/'));
  useEffect(() => {
    if (String(tenantId) !== params.asId && isInTenantContext) {
      setTenantId(Number(params.asId));
    }
  }, [tenantId, currentMatches, navigate, params.asId, isInTenantContext]);

  const tenantsCount = Object.keys(tenants.data || {}).length;
  const firstTenantId: string | undefined = Object.keys(tenants.data || {})?.[0];
  useEffect(() => {
    if (tenantsCount === 1 && !hasGlobalTenantsRead && params.asId === undefined) {
      setTenantId(Number(firstTenantId));
    }
  }, [tenantsCount, firstTenantId, hasGlobalTenantsRead, params.asId]);

  const [isResizing, setIsResizing] = useBoolean(false);

  return (
    <Box
      py={3}
      flex="0 0 20em"
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
      {Object.keys(tenants.data ?? {}).length > 1 || hasGlobalTenantsRead ? (
        <Box mb={3} px={3}>
          <Select
            value={
              selectedTenant === undefined
                ? {
                    label: 'No tenant (global)',
                    value: undefined,
                    styles: {
                      fontStyle: 'italic',
                      color: 'gray.500',
                      fontSize: 'large',
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
              if (newTenantId !== undefined && isInTenantContext) {
                navigate(`/as/${newTenantId}`);
              } else {
                if (isInTenantContext) {
                  navigate('/');
                  setTenantId(newTenantId);
                } else {
                  setTenantId(newTenantId);
                }
              }
            }}
            options={[
              {
                label: 'No tenant (global)',
                value: undefined,
                styles: {
                  fontStyle: 'italic',
                  color: 'gray.500',
                  fontSize: 'large',
                },
              },
              ...Object.values(tenants.data ?? ({} as Record<string, GetTenantDto>))
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
                bg: 'white',
              }),
              dropdownIndicator: (styles) => ({
                ...styles,
                width: '1.5em',
              }),
            }}
          />
        </Box>
      ) : null}
      <Text px={3} as="h3" color="gray.500" mb={2} fontWeight="600">
        Pages
      </Text>
      <NavButton
        {...{
          route: '/account',
          icon: BsPerson,
          activeIcon: BsPersonFill,
          text: 'Account',
          isActive: currentMatches.some((m) => m.pathname.startsWith('/account')),
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
