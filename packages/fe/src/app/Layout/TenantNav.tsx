import { Text } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  BsBook,
  BsBookFill,
  BsBuilding,
  BsBuildingFill,
  BsClipboard,
  BsClipboardFill,
  BsDatabase,
  BsDatabaseFill,
  BsFillMortarboardFill,
  BsFolder,
  BsFolderFill,
  BsKey,
  BsKeyFill,
  BsMortarboard,
  BsPeople,
  BsPeopleFill,
  BsPersonVcard,
  BsPersonVcardFill,
  BsShieldLock,
  BsShieldLockFill,
} from 'react-icons/bs';
import { useMatches } from 'react-router-dom';
import { sbeQueries } from '../api/queries/queries';
import { AuthorizeConfig, arrayElemIf, authorize, usePrivilegeCacheForConfig } from '../helpers';
import { isMatch, tagMatch } from './GlobalNav';
import { INavButtonProps, NavButton } from './NavButton';

export const TenantNav = (props: { tenantId: string }) => {
  const tenantId = Number(props.tenantId);
  const sbes = sbeQueries.useAll({ tenantId: props.tenantId });

  usePrivilegeCacheForConfig([
    {
      privilege: 'tenant.role:read',
      subject: {
        id: '__filtered__',
        tenantId: tenantId,
      },
    },
    {
      privilege: 'tenant.user:read',
      subject: {
        id: '__filtered__',
        tenantId: tenantId,
      },
    },
    {
      privilege: 'tenant.ownership:read',
      subject: {
        id: '__filtered__',
        tenantId: tenantId,
      },
    },
    ...Object.keys(sbes.data || {}).flatMap((sbeId): AuthorizeConfig[] => [
      {
        privilege: 'tenant.sbe.ods:read',
        subject: {
          tenantId: tenantId,
          sbeId: Number(sbeId),
          id: '__filtered__',
        },
      },
      {
        privilege: 'tenant.sbe.edorg:read',
        subject: {
          tenantId: tenantId,
          sbeId: Number(sbeId),
          id: '__filtered__',
        },
      },
      {
        privilege: 'tenant.sbe.vendor:read',
        subject: {
          tenantId: tenantId,
          sbeId: Number(sbeId),
          id: '__filtered__',
        },
      },
      {
        privilege: 'tenant.sbe.claimset:read',
        subject: {
          tenantId: tenantId,
          sbeId: Number(sbeId),
          id: '__filtered__',
        },
      },
      {
        privilege: 'tenant.sbe.edorg.application:read',
        subject: {
          tenantId: tenantId,
          sbeId: Number(sbeId),
          id: '__filtered__',
        },
      },
    ]),
  ]);
  const queryClient = useQueryClient();

  const items: INavButtonProps[] = [
    ...arrayElemIf(
      authorize({
        queryClient,
        config: {
          privilege: 'tenant.user:read',
          subject: { tenantId, id: '__filtered__' },
        },
      }),
      {
        route: `/as/${props.tenantId}/users`,
        icon: BsPeople,
        activeIcon: BsPeopleFill,
        text: 'Users',
      }
    ),
    ...arrayElemIf(
      authorize({
        queryClient,
        config: {
          privilege: 'tenant.role:read',
          subject: { tenantId, id: '__filtered__' },
        },
      }),
      {
        route: `/as/${props.tenantId}/roles`,
        icon: BsPersonVcard,
        activeIcon: BsPersonVcardFill,
        text: 'Roles',
      }
    ),
    ...arrayElemIf(
      authorize({
        queryClient,
        config: {
          privilege: 'tenant.ownership:read',
          subject: { tenantId, id: '__filtered__' },
        },
      }),
      {
        route: `/as/${props.tenantId}/ownerships`,
        icon: BsClipboard,
        activeIcon: BsClipboardFill,
        text: 'Ownerships',
      }
    ),
    {
      route: `/as/${props.tenantId}/sbes`,
      icon: BsFolder,
      activeIcon: BsFolderFill,
      text: 'Environments',
      childItems: Object.values(sbes.data || {}).map((sbe) => ({
        route: `/as/${props.tenantId}/sbes/${sbe.id}`,
        icon: BsFolder,
        activeIcon: BsFolderFill,
        text: sbe.displayName,
        childItems: [
          ...arrayElemIf(
            authorize({
              queryClient,
              config: {
                privilege: 'tenant.sbe.ods:read',
                subject: {
                  tenantId: tenantId,
                  sbeId: sbe.id,
                  id: '__filtered__',
                },
              },
            }),
            {
              route: `/as/${props.tenantId}/sbes/${sbe.id}/odss`,
              icon: BsDatabase,
              activeIcon: BsDatabaseFill,
              text: 'ODSs',
            }
          ),
          ...arrayElemIf(
            authorize({
              queryClient,
              config: {
                privilege: 'tenant.sbe.edorg:read',
                subject: {
                  tenantId: tenantId,
                  sbeId: sbe.id,
                  id: '__filtered__',
                },
              },
            }),
            {
              route: `/as/${props.tenantId}/sbes/${sbe.id}/edorgs`,
              icon: BsMortarboard,
              activeIcon: BsFillMortarboardFill,
              text: 'Ed-Orgs',
            }
          ),
          ...arrayElemIf(
            authorize({
              queryClient,
              config: {
                privilege: 'tenant.sbe.vendor:read',
                subject: {
                  tenantId: tenantId,
                  sbeId: sbe.id,
                  id: '__filtered__',
                },
              },
            }),
            {
              route: `/as/${props.tenantId}/sbes/${sbe.id}/vendors`,
              icon: BsBuilding,
              activeIcon: BsBuildingFill,
              text: 'Vendors',
            }
          ),
          ...arrayElemIf(
            authorize({
              queryClient,
              config: {
                privilege: 'tenant.sbe.edorg.application:read',
                subject: {
                  tenantId: tenantId,
                  sbeId: sbe.id,
                  id: '__filtered__',
                },
              },
            }),
            {
              route: `/as/${props.tenantId}/sbes/${sbe.id}/applications`,
              icon: BsKey,
              activeIcon: BsKeyFill,
              text: 'Applications',
            }
          ),
          ...arrayElemIf(
            authorize({
              queryClient,
              config: {
                privilege: 'tenant.sbe.claimset:read',
                subject: {
                  tenantId: tenantId,
                  sbeId: sbe.id,
                  id: '__filtered__',
                },
              },
            }),
            {
              route: `/as/${props.tenantId}/sbes/${sbe.id}/claimsets`,
              icon: BsShieldLock,
              activeIcon: BsShieldLockFill,
              text: 'Claimsets',
            }
          ),
        ],
      })),
    },
  ];

  const flatten = (item: INavButtonProps): INavButtonProps[] => [
    item,
    ...(item.childItems ?? []).flatMap((ci) => flatten(ci)),
  ];
  const flatItems = items.flatMap((item) => flatten(item));

  let deepestMatch = null;
  const currentMatches = useMatches();

  currentMatches.forEach((m) => {
    if (flatItems.some((item) => isMatch(m.pathname, item))) {
      deepestMatch = m.pathname;
    }
  });

  return (
    <>
      <Text px={3} mt={4} as="h3" color="gray.500" mb={2} fontWeight="600">
        Resources
      </Text>
      {tagMatch(items, deepestMatch).map((item) => (
        <NavButton key={item.text + item.route} {...item} />
      ))}
    </>
  );
};
