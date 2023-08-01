import { DataTable } from '@edanalytics/common-ui';
import { GetClaimsetDto, GetEdorgDto, createEdorgCompositeNaturalKey } from '@edanalytics/models';
import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { applicationQueries, claimsetQueries, edorgQueries } from '../../api';
import { ActionBarActions } from '../../helpers';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { ClaimsetLink, EdorgLink } from '../../routes';
import { PageTemplate } from '../PageTemplate';
import { NameCell } from './NameCell';
import { useApplicationsActions } from './useApplicationActions';

export const ApplicationsPage = () => {
  return (
    <PageTemplate title="Applications" actions={<ApplicationsPageActions />}>
      <ApplicationsPageContent />
    </PageTemplate>
  );
};

export const ApplicationsPageActions = () => {
  const params = useParams() as { sbeId: string; asId: string };

  const actions = useApplicationsActions({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  return <ActionBarActions actions={_.omit(actions, 'View')} />;
};

export const ApplicationsPageContent = () => {
  const params = useParams() as { sbeId: string; asId: string };
  const applications = applicationQueries.useAll({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  const edorgs = edorgQueries.useAll({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  const edorgsByEdorgId = {
    ...edorgs,
    data: Object.values(edorgs.data ?? {}).reduce<Record<string, GetEdorgDto>>((map, edorg) => {
      map[
        createEdorgCompositeNaturalKey({
          educationOrganizationId: edorg.educationOrganizationId,
          odsDbName: edorg.odsDbName,
        })
      ] = edorg;
      return map;
    }, {}),
  };
  const claimsets = claimsetQueries.useAll({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });
  const claimsetsByName = {
    ...claimsets,
    data: Object.values(claimsets.data ?? {}).reduce<Record<string, GetClaimsetDto>>(
      (map, claimset) => {
        map[claimset.name] = claimset;
        return map;
      },
      {}
    ),
  };

  return (
    <DataTable
      data={Object.values(applications?.data || {})}
      columns={[
        {
          accessorKey: 'displayName',
          cell: NameCell({ asId: params.asId, sbeId: params.sbeId }),
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
                    educationOrganizationId: info.row.original.educationOrganizationId,
                    odsDbName: 'EdFi_Ods_' + info.row.original.odsInstanceName,
                  })
                ]?.id
              }
            />
          ),
        },
        {
          id: 'claimest',
          accessorFn: (info) => getRelationDisplayName(info.claimSetName, claimsetsByName),
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
  );
};
