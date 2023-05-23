import { Heading, HStack } from '@chakra-ui/react';
import { DataTable } from '@edanalytics/common-ui';
import { useParams } from '@tanstack/router';
import { sbeQueries } from '../../api';
import { getRelationDisplayName } from '../../helpers/getRelationDisplayName';
import { StandardRowActions } from '../../helpers/getStandardActions';
import {
  SbeGlobalLink,
  sbeGlobalRoute,
  sbesGlobalRoute,
  UserLink,
} from '../../routes';

export const SbesGlobalPage = () => {
  const params = useParams({ from: sbesGlobalRoute.id });
  const sbes = sbeQueries.useAll({});
  const deleteSbe = sbeQueries.useDelete({});
  const users = { data: undefined } as any; // userQueries.useAll({  }); //TODO add users into global scope as well

  return (
    <>
      <Heading mb={4} fontSize="lg">
        Sbes
      </Heading>
      <DataTable
        data={Object.values(sbes?.data || {})}
        columns={[
          {
            accessorKey: 'displayName',
            cell: (info) => (
              <HStack justify="space-between">
                <SbeGlobalLink id={info.row.original.id} query={sbes} />
                <HStack className="row-hover" color="gray.600" align="middle">
                  <StandardRowActions
                    info={info}
                    mutation={deleteSbe.mutate}
                    route={sbeGlobalRoute}
                    params={(params: any) => ({
                      ...params,
                      sbeId: String(info.row.original.id),
                    })}
                  />
                </HStack>
              </HStack>
            ),
            header: () => 'Name',
          },
          {
            id: 'modifiedBy',
            accessorFn: (info) =>
              getRelationDisplayName(info.modifiedById, users),
            header: () => 'Modified by',
            cell: (info) => (
              <UserLink query={users} id={info.row.original.modifiedById} />
            ),
          },
          {
            accessorKey: 'createdDetailed',
            header: () => 'Created',
          },
          {
            id: 'createdBy',
            accessorFn: (info) =>
              getRelationDisplayName(info.createdById, users),
            header: () => 'Created by',
            cell: (info) => (
              <UserLink query={users} id={info.row.original.createdById} />
            ),
          },
        ]}
      />
    </>
  );
};
