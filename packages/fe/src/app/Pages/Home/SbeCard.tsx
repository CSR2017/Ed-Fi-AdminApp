import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Heading,
  StackDivider,
  TabList,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { GetSbeDto } from '@edanalytics/models';
import { useApplicationContent } from './useApplicationContent';
import { useEdorgContent } from './useEdorgContent';
import { useOdsContent } from './useOdsContent';

export const SbeCard = (props: { sbe: GetSbeDto }) => {
  const OdsContent = useOdsContent({ sbe: props.sbe });
  const EdorgContent = useEdorgContent({ sbe: props.sbe });
  const ApplicationContent = useApplicationContent({ sbe: props.sbe });

  return (
    <Card
      mb={4}
      boxShadow="md"
      w="fit-content"
      minWidth="55em"
      border="1px solid"
      borderColor="gray.200"
    >
      <CardHeader pb={0}>
        <Heading size="md">{props.sbe.displayName}</Heading>
      </CardHeader>
      <CardBody>
        <HStack alignItems="start" my={4} gap={4} divider={<StackDivider />}>
          <HStack flexGrow={5} spacing={10} alignItems="start">
            {OdsContent.Stat}
            {EdorgContent.Stat}
            {ApplicationContent.Stat}
          </HStack>
          <Box color="gray.500">
            <Text title={props.sbe.createdDetailed}>Created: {props.sbe.createdShort}</Text>
            <Text title={props.sbe.modifiedDetailed}>Updated: {props.sbe.modifiedShort}</Text>
            <Text title={props.sbe.configPublic?.lastSuccessfulPullLong}>
              Synced: {props.sbe.configPublic?.lastSuccessfulPullShort}
            </Text>
          </Box>
        </HStack>
        <Accordion mt={10} allowMultiple defaultIndex={[]}>
          <AccordionItem>
            <AccordionButton>
              <Heading fontWeight="medium" fontSize="lg" as="span" flex="1" textAlign="left">
                Contents
              </Heading>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Tabs>
                <TabList>
                  {OdsContent.Tab}
                  {EdorgContent.Tab}
                  {ApplicationContent.Tab}
                </TabList>

                <TabPanels>
                  {OdsContent.TabContent}
                  {EdorgContent.TabContent}
                  {ApplicationContent.TabContent}
                </TabPanels>
              </Tabs>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
};
