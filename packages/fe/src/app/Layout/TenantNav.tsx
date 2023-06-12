import { Text } from '@chakra-ui/react';
import {
  AnyRoute,
  AnyRoutesInfo,
  RouteMatch,
  useRouter,
} from '@tanstack/router';
import _ from 'lodash';
import {
  BsBook,
  BsBookFill,
  BsBuilding,
  BsBuildingFill,
  BsClipboard,
  BsClipboardFill,
  BsCloudRain,
  BsCloudRainFill,
  BsDatabase,
  BsDatabaseFill,
  BsFolder,
  BsFolderFill,
  BsGear,
  BsGearFill,
  BsKey,
  BsKeyFill,
  BsPeople,
  BsPeopleFill,
  BsPersonVcard,
  BsPersonVcardFill,
  BsShieldLock,
  BsShieldLockFill,
} from 'react-icons/bs';
import { sbeQueries } from '../api/queries/queries';
import {
  applicationsRoute,
  claimsetsRoute,
  edorgsRoute,
  odssRoute,
  ownershipsRoute,
  rolesRoute,
  sbeRoute,
  sbesRoute,
  usersRoute,
  vendorsRoute,
} from '../routes';
import { INavButtonProps, NavButton } from './NavButton';
import { arrayElemIf, authorize, usePrivilegeCacheForConfig } from '../helpers';
import { useQueryClient } from '@tanstack/react-query';

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
  ]);
  usePrivilegeCacheForConfig(
    Object.keys(sbes.data || {}).flatMap((sbeId) => [
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
    ])
  );
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
        route: usersRoute,
        params: { asId: props.tenantId },
        icon: BsPeople,
        activeIcon: BsPeopleFill,
        text: 'Users',
      }
    ),
    ...arrayElemIf(
      authorize({
        queryClient,
        config: {
          privilege: 'tenant.user:read',
          subject: { tenantId, id: '__filtered__' },
        },
      }),
      {
        route: rolesRoute,
        params: { asId: props.tenantId },
        icon: BsPersonVcard,
        activeIcon: BsPersonVcardFill,
        text: 'Roles',
      }
    ),
    ...arrayElemIf(
      authorize({
        queryClient,
        config: {
          privilege: 'tenant.user:read',
          subject: { tenantId, id: '__filtered__' },
        },
      }),
      {
        route: ownershipsRoute,
        params: { asId: props.tenantId },
        icon: BsClipboard,
        activeIcon: BsClipboardFill,
        text: 'Ownerships',
      }
    ),
    {
      route: sbesRoute,
      params: { asId: props.tenantId },
      icon: BsFolder,
      activeIcon: BsFolderFill,
      text: 'Environments',
      childItems: Object.values(sbes.data || {}).map((sbe) => ({
        route: sbeRoute,
        params: { asId: props.tenantId, sbeId: String(sbe.id) },
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
              route: odssRoute,
              params: { asId: props.tenantId, sbeId: String(sbe.id) },
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
              route: edorgsRoute,
              params: { asId: props.tenantId, sbeId: String(sbe.id) },
              icon: BsBook,
              activeIcon: BsBookFill,
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
              route: vendorsRoute,
              params: { asId: props.tenantId, sbeId: String(sbe.id) },
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
              route: applicationsRoute,
              params: { asId: props.tenantId, sbeId: String(sbe.id) },
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
              route: claimsetsRoute,
              params: { asId: props.tenantId, sbeId: String(sbe.id) },
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
  const router = useRouter();

  const isMatch = <
    M extends Pick<RouteMatch<AnyRoutesInfo, AnyRoute>, 'params' | 'route'>
  >(
    activeRoute: M,
    item: INavButtonProps
  ) => {
    const itemParams = item.params || {};
    const paramsEqual = _.isMatch(activeRoute.params, itemParams);
    const sameRoute = item.route.id === activeRoute.route.id;

    return sameRoute && paramsEqual;
  };

  router.state.currentMatches.forEach((m) => {
    if (flatItems.some((item) => isMatch(m, item))) {
      deepestMatch = m;
    }
  });

  const tagMatch = <
    M extends Pick<RouteMatch<AnyRoutesInfo, AnyRoute>, 'params' | 'route'>
  >(
    items: INavButtonProps[],
    match: M | null
  ): INavButtonProps[] =>
    match === null
      ? items
      : items.map((item) => ({
          ...item,
          isActive: isMatch(match, item),
          childItems: tagMatch(item.childItems || [], match),
        }));

  return (
    <>
      <Text px={3} mt={4} as="h3" color="gray.500" mb={2} fontWeight="600">
        Resources
      </Text>
      {tagMatch(items, deepestMatch).map((item) => (
        <NavButton key={item.text + item.route.fullPath} {...item} />
      ))}
    </>
  );
};
