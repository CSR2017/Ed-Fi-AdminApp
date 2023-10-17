import { Text } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import {
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
import { sbeQueries } from '../api';
import {
  AuthorizeConfig,
  arrayElemIf,
  authorize,
  useAuthorize,
  usePrivilegeCacheForConfig,
} from '../helpers';
import { isMatch, tagMatch } from './GlobalNav';
import { INavButtonProps, NavButton } from './NavButton';

export const TenantNav = (props: { tenantId: string }) => {
  const tenantId = Number(props.tenantId);
  const queryClient = useQueryClient();
  const sbeAuth: AuthorizeConfig = {
    privilege: 'tenant.sbe:read',
    subject: {
      id: '__filtered__',
      tenantId,
    },
  };
  const sbes = sbeQueries.useAll({ optional: true, tenantId: tenantId });

  usePrivilegeCacheForConfig([
    sbeAuth,
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

  const sbeItems = Object.values(sbes.data || {}).map((sbe) => ({
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
  }));

  const mainItems: INavButtonProps[] = [
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
    // TODO these are ATM not considered MVP, and the ultimate design is TBD... but in theory tenants should be able to view their roles and ownerships. Code below "correct" as of 7/17/23.
    // ...arrayElemIf(
    //   authorize({
    //     queryClient,
    //     config: {
    //       privilege: 'tenant.role:read',
    //       subject: { tenantId, id: '__filtered__' },
    //     },
    //   }),
    //   {
    //     route: `/as/${props.tenantId}/roles`,
    //     icon: BsPersonVcard,
    //     activeIcon: BsPersonVcardFill,
    //     text: 'Roles',
    //   }
    // ),
    // ...arrayElemIf(
    //   authorize({
    //     queryClient,
    //     config: {
    //       privilege: 'tenant.ownership:read',
    //       subject: { tenantId, id: '__filtered__' },
    //     },
    //   }),
    //   {
    //     route: `/as/${props.tenantId}/ownerships`,
    //     icon: BsClipboard,
    //     activeIcon: BsClipboardFill,
    //     text: 'Ownerships',
    //   }
    // ),
  ];

  const flatten = (item: INavButtonProps): INavButtonProps[] => [
    item,
    ...(item.childItems ?? []).flatMap((ci) => flatten(ci)),
  ];
  const allItemsFlat = [...mainItems, ...sbeItems].flatMap((item) => flatten(item));

  let deepestMatch = null;
  const currentMatch = useMatches().slice(-1)[0];

  allItemsFlat.some((item) => {
    if (isMatch(currentMatch.pathname, item)) {
      deepestMatch = currentMatch.pathname;
      return true;
    } else {
      return false;
    }
  });

  return (
    <>
      {tagMatch(mainItems, deepestMatch).map((item) => (
        <NavButton key={item.text + item.route} {...item} />
      ))}
      {sbeItems.length ? (
        <>
          <Text px={3} mt={4} as="h3" color="gray.600" mb={2} fontWeight="600">
            Environments
          </Text>
          {tagMatch(sbeItems, deepestMatch).map((item) => (
            <NavButton key={item.text + item.route} {...item} />
          ))}
        </>
      ) : null}
    </>
  );
};
