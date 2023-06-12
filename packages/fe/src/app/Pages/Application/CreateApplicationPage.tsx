import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  useClipboard,
} from '@chakra-ui/react';
import {
  ApplicationYopassResponseDto,
  PostApplicationDto,
  PutApplicationDto,
} from '@edanalytics/models';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useNavigate, useParams } from '@tanstack/router';
import { ReactNode, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  claimsetQueries,
  edorgQueries,
  useApplicationPost,
  vendorQueries,
} from '../../api';
import { useNavToParent } from '../../helpers';
import { applicationIndexRoute, applicationRoute } from '../../routes';
import { PageTemplate } from '../PageTemplate';
import {
  ClaimsetPickerOptions,
  EdorgPickerOptions,
  VendorPickerOptions,
} from '../../helpers/FormPickerOptions';
const resolver = classValidatorResolver(PutApplicationDto);

export const CreateApplicationPage = (): ReactNode => {
  const navigate = useNavigate();
  const params = useParams({ from: applicationIndexRoute.id });
  const navToParentOptions = useNavToParent();

  const goToView = (id: string) => {
    navigate({
      to: applicationRoute.fullPath,
      params: (old: any) => ({ ...old, applicationId: id }),
      search: {},
    });
  };
  const [result, setResult] = useState<ApplicationYopassResponseDto | null>(
    null
  );
  const clipboard = useClipboard('');

  const postApplication = useApplicationPost({
    sbeId: params.sbeId,
    tenantId: params.asId,
    callback: (result) => {
      setResult(result);
      clipboard.setValue(result.link);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
    control,
  } = useForm<PostApplicationDto>({
    resolver,
    defaultValues: new PostApplicationDto(),
  });

  return (
    <PageTemplate title="New application">
      <Modal
        isOpen={!!result}
        onClose={() => {
          setResult(null);
          clipboard.setValue('');
          result && goToView(String(result.applicationId));
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Success!</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text as="b">Use this link to see your new credentials: </Text>
            <Link href={clipboard.value} color="blue.600">
              {clipboard.value}
            </Link>
            <Text my={5} as="p" fontStyle="italic">
              Note: this link will work only once, and will expire after 7 days.
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
      <form
        onSubmit={handleSubmit((data) => {
          postApplication.mutate(data);
        })}
      >
        <FormControl isInvalid={!!errors.applicationName}>
          <FormLabel>Application name</FormLabel>
          <Input {...register('applicationName')} placeholder="name" />
          <FormErrorMessage>{errors.applicationName?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.educationOrganizationId}>
          <FormLabel>Ed-org</FormLabel>
          <Controller
            control={control}
            name="educationOrganizationId"
            render={(props) => (
              <Select
                placeholder="Select an Ed-org"
                {...props.field}
                onChange={(event) => {
                  props.field.onChange(Number(event.target.value));
                }}
              >
                <EdorgPickerOptions
                  sbeId={params.sbeId}
                  tenantId={params.asId}
                />
              </Select>
            )}
          />
          <FormErrorMessage>
            {errors.educationOrganizationIds?.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.vendorId}>
          <FormLabel>Vendor</FormLabel>
          <Controller
            control={control}
            name="vendorId"
            render={(props) => (
              <Select
                placeholder="Select a vendor"
                {...props.field}
                onChange={(event) => {
                  props.field.onChange(Number(event.target.value));
                }}
              >
                <VendorPickerOptions
                  tenantId={params.asId}
                  sbeId={params.sbeId}
                />
              </Select>
            )}
          />
          <FormErrorMessage>{errors.vendorId?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.claimSetName}>
          <FormLabel>Claimset</FormLabel>
          <Select placeholder="Select a claimset" {...register('claimSetName')}>
            <ClaimsetPickerOptions
              tenantId={params.asId}
              sbeId={params.sbeId}
            />
          </Select>
          <FormErrorMessage>{errors.claimSetName?.message}</FormErrorMessage>
        </FormControl>
        <ButtonGroup>
          <Button mt={4} colorScheme="teal" isLoading={isLoading} type="submit">
            Save
          </Button>
          <Button
            mt={4}
            colorScheme="teal"
            variant="ghost"
            isLoading={isLoading}
            type="reset"
            onClick={() => {
              navigate(navToParentOptions);
            }}
          >
            Cancel
          </Button>
        </ButtonGroup>
      </form>
    </PageTemplate>
  );
};
