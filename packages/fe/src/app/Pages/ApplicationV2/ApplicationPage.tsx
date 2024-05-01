import { Attribute, PageActions, PageContentCard, PageTemplate } from '@edanalytics/common-ui';
import omit from 'lodash/omit';
import { ErrorBoundary } from 'react-error-boundary';
import { useLocation, useParams } from 'react-router-dom';
import { applicationQueriesV2, claimsetQueriesV2 } from '../../api';

import { Heading, ScaleFade, Text } from '@chakra-ui/react';
import { GetClaimsetMultipleDtoV2 } from '@edanalytics/models';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTeamEdfiTenantNavContextLoaded } from '../../helpers';
import { useSearchParamsObject } from '../../helpers/useSearch';
import { EditApplication } from './EditApplication';
import { ViewApplication } from './ViewApplication';
import { useSingleApplicationActions } from './useApplicationActions';

export const ApplicationPageV2 = () => {
  const credsLink: unknown = useLocation().state;
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [showUrl, setShowUrl] = useState<boolean>(false);

  useEffect(() => {
    if (typeof credsLink === 'string') {
      try {
        const parsedUrl = new URL(credsLink);
        // clear the state so that the link doesn't show up again on refresh or back nav in the future
        window.history.replaceState({}, '');
        setUrl(parsedUrl.toString());
        // delay for a bit for extra visibility
        setTimeout(() => {
          setShowUrl(true);
        }, 500);
      } catch (error) {
        // leave undefined
      }
    }
  }, [credsLink]);

  return (
    <PageTemplate
      title={
        <ErrorBoundary fallbackRender={() => 'Application'}>
          <ApplicationPageTitle />
        </ErrorBoundary>
      }
      actions={<ApplicationPageActions />}
      customPageContentCard
    >
      <PageContentCard>
        <ApplicationPageContent />
      </PageContentCard>
      {url ? (
        <ScaleFade in={showUrl} unmountOnExit>
          <PageContentCard borderColor="teal.200" bg="teal.50" mt={4}>
            <Heading mb={4} whiteSpace="nowrap" color="gray.700" size="md">
              Key and secret created
            </Heading>
            <Text fontStyle="italic">
              The link below will take you to a page where you can view the credentials. When you go
              there you will be asked to confirm whether you actually want to retrieve them, because
              that can only be done once. If you need to give the link to someone else, make sure
              you don't retrieve the credentials yourself first, or else the link will no longer
              work for them.
            </Text>
            <Text mt={4} fontStyle="italic">
              We limit the retrieval to one time only for security reasons, but note that you can
              always reset the credentials again if there's a mistake.
            </Text>
            <Attribute
              mt={8}
              p={0}
              label="Link to credentials"
              value={url.toString()}
              isCopyable
              isUrl
              isUrlExternal
            />
          </PageContentCard>
        </ScaleFade>
      ) : null}
    </PageTemplate>
  );
};

export const ApplicationPageTitle = () => {
  const { asId, edfiTenant } = useTeamEdfiTenantNavContextLoaded();

  const params = useParams() as {
    applicationId: string;
  };

  const application = useQuery(
    applicationQueriesV2.getOne({
      id: params.applicationId,
      edfiTenant,
      teamId: asId,
    })
  ).data;

  return <>{application?.displayName || 'Application'}</>;
};

export const ApplicationPageContent = () => {
  const { asId, edfiTenantId, edfiTenant } = useTeamEdfiTenantNavContextLoaded();
  const params = useParams() as {
    edfiTenantId: string;
    asId: string;
    applicationId: string;
  };

  const application = useQuery(
    applicationQueriesV2.getOne({
      id: params.applicationId,
      edfiTenant: edfiTenant,
      teamId: asId,
    })
  ).data;
  const claimsets = useQuery(
    claimsetQueriesV2.getAll({
      edfiTenant: edfiTenant,
      teamId: asId,
    })
  );
  const claimsetsByName = Object.values(claimsets.data ?? {}).reduce<
    Record<string, GetClaimsetMultipleDtoV2>
  >((map, claimset) => {
    map[claimset.name] = claimset;
    return map;
  }, {});
  const claimset =
    claimsetsByName && application ? claimsetsByName[application.claimSetName] : undefined;

  const { edit } = useSearchParamsObject((value) => ({
    edit: 'edit' in value && value.edit === 'true',
  }));

  return application ? (
    edit ? (
      claimsets.isSuccess ? (
        <EditApplication application={application} claimset={claimset} />
      ) : null
    ) : (
      <ViewApplication application={application} />
    )
  ) : null;
};

export const ApplicationPageActions = () => {
  const { asId, edfiTenant } = useTeamEdfiTenantNavContextLoaded();
  const params = useParams() as {
    edfiTenantId: string;
    asId: string;
    applicationId: string;
  };

  const application = useQuery(
    applicationQueriesV2.getOne({
      id: params.applicationId,
      edfiTenant: edfiTenant,
      teamId: asId,
    })
  ).data;

  const actions = useSingleApplicationActions({
    application,
  });

  return <PageActions actions={omit(actions, 'View')} />;
};
