import { Tooltip, chakra } from '@chakra-ui/react';
import { DateValue } from '@edanalytics/common-ui';
import { sbeQueries } from '../../api';
import { useNavContext } from '../../helpers';

/** Display last sync date of SBE in upper right corner of a container (overlaid using absolute position) */
export const SbeSyncDate = (props: { left?: boolean }) => {
  const navParams = useNavContext();
  const sbe = sbeQueries.useOne({ id: navParams.sbeId!, tenantId: navParams.asId! });
  return sbe.data?.configPublic?.lastSuccessfulPull ? (
    <chakra.div position="relative" w="100%">
      <Tooltip label="Ed-Orgs are not shown live. They're synced from Ed-Fi once per day.">
        <chakra.div
          position="absolute"
          {...(props.left ? { left: 0 } : { right: 0 })}
          w="max-content"
          fontSize="sm"
          color="gray.500"
        >
          Data as of <DateValue value={sbe.data.configPublic.lastSuccessfulPull} />
        </chakra.div>
      </Tooltip>
    </chakra.div>
  ) : null;
};
