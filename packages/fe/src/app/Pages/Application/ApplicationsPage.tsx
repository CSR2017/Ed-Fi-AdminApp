import { HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import {
  GetClaimsetDto,
  GetEdorgDto,
  createEdorgCompositeNaturalKey,
} from '@edanalytics/models';
import { useParams } from 'react-router-dom';
import _ from 'lodash';
import {
  applicationQueries,
  claimsetQueries,
  edorgQueries,
  userQueries,
} from '../../api';
import { ActionBarActions } from '../../helpers';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import {
  ApplicationLink,
  ClaimsetLink,
  EdorgLink,
  applicationsRoute,
} from '../../routes';
import { PageTemplate } from '../PageTemplate';
import { useApplicationsActions } from './useApplicationActions';

export const ApplicationsPage = () => {
  const params = useParams() as { sbeId: string; asId: string };
  const applications = applicationQueries.useAll({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  const deleteApplication = applicationQueries.useDelete({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  const users = userQueries.useAll({ tenantId: params.asId });
  const edorgs = edorgQueries.useAll({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  const edorgsByEdorgId = {
    ...edorgs,
    data: Object.values(edorgs.data ?? {}).reduce<Record<string, GetEdorgDto>>(
      (map, edorg) => {
        map[
          createEdorgCompositeNaturalKey({
            educationOrganizationId: edorg.educationOrganizationId,
            odsDbName: edorg.odsDbName,
          })
        ] = edorg;
        return map;
      },
      {}
    ),
  };
  const claimsets = claimsetQueries.useAll({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  const claimsetsByName = {
    ...claimsets,
    data: Object.values(claimsets.data ?? {}).reduce<
      Record<string, GetClaimsetDto>
    >((map, claimset) => {
      map[claimset.name] = claimset;
      return map;
    }, {}),
  };

  const actions = useApplicationsActions({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  return (
    <PageTemplate
      title="Applications"
      actions={<ActionBarActions actions={_.omit(actions, 'View')} />}
    >
      <DataTable
        data={Object.values(applications?.data || {})}
        columns={[
          {
            accessorKey: 'displayName',
            cell: (info) => (
              <HStack justify="space-between">
                <ApplicationLink
                  id={info.row.original.id}
                  query={applications}
                />
              </HStack>
            ),
            header: () => 'Name',
          },
          {
            id: 'edorg',
            accessorFn: (info) =>
              getRelationDisplayName(
                createEdorgCompositeNaturalKey({
                  educationOrganizationId: info.educationOrganizationId,
                  odsDbName: 'EdFi_Ods_' + info.odsInstanceName,
                }),
                edorgsByEdorgId
              ),
            header: () => 'Education organization',
            cell: (info) => (
              <EdorgLink
                query={edorgs}
                id={
                  edorgsByEdorgId.data[
                    createEdorgCompositeNaturalKey({
                      educationOrganizationId:
                        info.row.original.educationOrganizationId,
                      odsDbName:
                        'EdFi_Ods_' + info.row.original.odsInstanceName,
                    })
                  ]?.id
                }
              />
            ),
          },
          {
            id: 'claimest',
            accessorFn: (info) =>
              getRelationDisplayName(info.claimSetName, claimsetsByName),
            header: () => 'Claimset',
            cell: (info) => (
              <ClaimsetLink
                query={claimsets}
                id={claimsetsByName.data[info.row.original.claimSetName]?.id}
              />
            ),
          },
        ]}
      />
    </PageTemplate>
  );
};
