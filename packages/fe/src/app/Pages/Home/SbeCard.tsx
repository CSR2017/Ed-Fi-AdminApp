import { Accordion, Card, CardBody, CardHeader, HStack, Heading } from '@chakra-ui/react';
import { GetSbeDto } from '@edanalytics/models';
import { NavContextProvider } from '../../helpers';
import { useApplicationContent } from './useApplicationContent';
import { useEdorgContent } from './useEdorgContent';
import { useOdsContent } from './useOdsContent';

export const SbeCard = (props: { sbe: GetSbeDto }) => {
  return (
    <Card mb={8} w="fit-content" minWidth="55em" variant="elevated">
      <CardHeader pb={0}>
        <Heading color="gray.600" size="md">
          {props.sbe.displayName}
        </Heading>
      </CardHeader>
      <CardBody>
        <SbeCardContent sbe={props.sbe} />
      </CardBody>
    </Card>
  );
};

export const SbeCardContent = (props: { sbe: GetSbeDto }) => {
  const OdsContent = useOdsContent({ sbe: props.sbe });
  const EdorgContent = useEdorgContent({ sbe: props.sbe });
  const ApplicationContent = useApplicationContent({ sbe: props.sbe });

  return (
    <NavContextProvider sbeId={props.sbe.id}>
      <HStack flexGrow={5} spacing={10} alignItems="start">
        {OdsContent.Stat}
        {EdorgContent.Stat}
        {ApplicationContent.Stat}
      </HStack>
      <Accordion mt={10} allowMultiple defaultIndex={[]}>
        {OdsContent.AccordionItem}
        {EdorgContent.AccordionItem}
        {ApplicationContent.AccordionItem}
      </Accordion>
    </NavContextProvider>
  );
};
