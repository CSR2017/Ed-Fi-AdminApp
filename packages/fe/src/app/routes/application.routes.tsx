import { Link, Text } from '@chakra-ui/react';
import { GetApplicationDto } from '@edanalytics/models';
import { UseQueryResult } from '@tanstack/react-query';
import { RouteObject, Link as RouterLink, useParams } from 'react-router-dom';
import { ApplicationPage } from '../Pages/Application/ApplicationPage';
import { ApplicationsPage } from '../Pages/Application/ApplicationsPage';
import { applicationQueries } from '../api';
import { getRelationDisplayName, useNavContext } from '../helpers';
import { getEntityFromQuery } from '../helpers/getEntityFromQuery';
import { CreateApplicationPage } from '../Pages/Application/CreateApplicationPage';

const ApplicationBreadcrumb = () => {
  const params = useParams() as {
    applicationId: string;
    asId: string;
    sbeId: string;
  };
  const application = applicationQueries.useOne({
    id: params.applicationId,
    tenantId: params.asId,
    sbeId: params.sbeId,
  });
  return application.data?.displayName ?? params.applicationId;
};
export const applicationIndexRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId/applications/:applicationId/',
  element: <ApplicationPage />,
};
export const applicationCreateRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId/applications/create',
  handle: { crumb: () => 'Create' },
  element: <CreateApplicationPage />,
};

export const applicationRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId/applications/:applicationId',
  handle: { crumb: ApplicationBreadcrumb, fallbackCrumb: () => 'Application' },
};
export const applicationsIndexRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId/applications/',
  element: <ApplicationsPage />,
};
export const applicationsRoute: RouteObject = {
  path: '/as/:asId/sbes/:sbeId/applications',
  handle: { crumb: () => 'Applications' },
};

export const ApplicationLink = (props: {
  id: number | undefined;
  query: UseQueryResult<Record<string | number, GetApplicationDto>, unknown>;
  sbeId?: string | number;
}) => {
  const application = getEntityFromQuery(props.id, props.query);
  const navContext = useNavContext();
  const sbeId = navContext.sbeId!;
  const asId = navContext.asId!;

  return application ? (
    <Link as="span">
      <RouterLink
        title="Go to application"
        to={`/as/${asId}/sbes/${sbeId ?? props.sbeId}/applications/${application.id}`}
      >
        {getRelationDisplayName(application.id, props.query)}
      </RouterLink>
    </Link>
  ) : typeof props.id === 'number' ? (
    <Text title="Application may have been deleted." as="i" color="gray.500">
      not found
    </Text>
  ) : null;
};
