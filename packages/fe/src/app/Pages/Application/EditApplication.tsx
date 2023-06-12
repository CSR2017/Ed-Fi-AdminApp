import {
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
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
  GetApplicationDto,
  PutApplicationDto,
} from '@edanalytics/models';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useNavigate, useParams } from '@tanstack/router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  applicationQueries,
  claimsetQueries,
  edorgQueries,
  useApplicationPut,
} from '../../api';
import {
  ClaimsetPickerOptions,
  EdorgPickerOptionsEdorgId,
  VendorPickerOptions,
} from '../../helpers/FormPickerOptions';
import { applicationIndexRoute, applicationRoute } from '../../routes';

const resolver = classValidatorResolver(PutApplicationDto);

export const EditApplication = (props: { application: GetApplicationDto }) => {
  const { application } = props;
  const navigate = useNavigate();
  const goToView = () => {
    navigate({
      to: applicationRoute.fullPath,
      params: (old: any) => old,
      search: {},
    });
  };
  const params = useParams({ from: applicationIndexRoute.id });
  const edorgs = edorgQueries.useAll({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });

  const claimsets = claimsetQueries.useAll({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });

  const putApplication = applicationQueries.usePut({
    sbeId: params.sbeId,
    tenantId: params.asId,
    callback: goToView,
  });
  const defaultValues = new PutApplicationDto();
  defaultValues.applicationId = application.applicationId;
  defaultValues.applicationName = application.displayName;
  defaultValues.claimSetName = application.claimSetName;
  defaultValues.educationOrganizationIds = [
    application.educationOrganizationId,
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
    control,
  } = useForm<PutApplicationDto>({
    resolver,
    defaultValues,
  });

  return edorgs.data && claimsets.data ? (
    <form
      onSubmit={handleSubmit((data) => {
        putApplication.mutate(data);
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
              value={String(props.field.value)}
              onChange={(event) => {
                props.field.onChange(Number(event.target.value));
              }}
            >
              <EdorgPickerOptionsEdorgId
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
          <ClaimsetPickerOptions tenantId={params.asId} sbeId={params.sbeId} />
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
          onClick={goToView}
        >
          Cancel
        </Button>
      </ButtonGroup>
    </form>
  ) : null;
};
